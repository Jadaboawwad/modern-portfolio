// Talks to the assestant voice-avatar app, proxied through /avatar-api (dev:
// next.config.js rewrite to localhost:3000; prod: Netlify's avatar-proxy edge
// function -> ngrok -> gateway.conf -> the host's assestant process) to turn
// a chat answer into a lip-synced video clip. Any failure here must never
// break the text chat, since the avatar pipeline shares an 8GB GPU with the
// RAG backend's Ollama model and can legitimately be unavailable (OOM, cold
// start, assestant not running).

export const AVATAR_API_BASE =
  process.env.NEXT_PUBLIC_AVATAR_API_URL || "/avatar-api";

export const AVATAR_IDLE_IMAGE = `${AVATAR_API_BASE}/avatar/reference.png`;

const SPEAK_TIMEOUT_MS = 60_000;

// The avatar pipeline (Wav2Lip + GFPGAN) renders at roughly real-time speed
// once warmed up on this GPU (measured: ~245s of speech took ~262s to
// render), and GFPGAN restoration is already at its measured hardware floor
// (~76ms/frame) -- batching and fp16 were tried and rejected for quality
// reasons (see avatar_service's face_restore.py docstring). So a long RAG
// answer can't be rendered faster without losing quality; it can only be
// made shorter. Capping at ~2-3 sentences keeps rendering comfortably inside
// SPEAK_TIMEOUT_MS above (measured rate implies ~48s for this cap) without
// touching any proxy/gateway timeout in the prod path. The full text answer
// is unaffected -- only the spoken/lip-synced clip is trimmed.
const MAX_SPOKEN_CHARS = 350;

// Cuts at the last sentence boundary at or before MAX_SPOKEN_CHARS so the
// clip ends on a natural pause instead of mid-word; falls back to a hard cut
// if no boundary is found early enough to still be worth keeping.
function truncateForSpeech(text) {
  if (text.length <= MAX_SPOKEN_CHARS) return text;

  const slice = text.slice(0, MAX_SPOKEN_CHARS);
  const boundary = Math.max(
    slice.lastIndexOf("."),
    slice.lastIndexOf("!"),
    slice.lastIndexOf("?"),
    slice.lastIndexOf("؟"), // Arabic question mark
    slice.lastIndexOf("۔"), // Arabic full stop (used in some fonts/locales)
  );

  if (boundary > MAX_SPOKEN_CHARS * 0.4) {
    return slice.slice(0, boundary + 1).trim();
  }
  return slice.trim();
}

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, ""))
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/(?<!\w)_(.*?)_(?!\w)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*[٠-٩]+\.\s+/gm, "") // Arabic-indic numbered list markers
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Sends a recorded audio clip to the avatar service's Whisper endpoint.
 * Pass UI language ("en" | "ar") so the service can pick the Arabic-tuned
 * model vs the general English turbo model.
 * Returns the transcribed text, or null if transcription failed/returned
 * nothing (caller should fall back to asking the user to type instead).
 */
export async function transcribeAudio(blob, language = "en") {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), SPEAK_TIMEOUT_MS);

  try {
    const form = new FormData();
    form.append("audio", blob, "recording.webm");
    form.append("language", language === "ar" ? "ar" : "en");

    const response = await fetch(`${AVATAR_API_BASE}/api/transcribe`, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const { text } = await response.json();
    return text?.trim() || null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

// The streaming endpoint needs its own, much longer ceiling than
// SPEAK_TIMEOUT_MS: that 60s cap was sized for a single-shot response
// arriving all at once, but a streamed response's connection has to stay
// open for the *whole* render (which tracks speech length almost 1:1 -- a
// long answer can legitimately take minutes; see resident_inference.py's
// timing notes), not just the time to the first chunk. This is just a
// safety net against a truly hung connection, not an expected ceiling.
const STREAM_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Like speakWithAvatar, but streams lip-synced clips of `text` in ~4s
 * segments as they're ready instead of waiting for the whole thing.
 *
 * Callbacks (all optional):
 *   onAudio(audioUrl, chunkSeconds) -- fires once after TTS with the full
 *     wav URL so the client can play one unbroken speech track while video
 *     chunks swap muted underneath.
 *   onChunk(videoUrl, isLast, meta) -- fires per segment; meta includes
 *     { chunkIndex, chunkStart, chunkDuration } for clock resync against
 *     the master audio.
 *
 * Unlike speakWithAvatar, the text is NOT truncated to MAX_SPOKEN_CHARS:
 * streaming is exactly what removes the need for that cap. Never throws --
 * a failure before or during the stream just means no further callbacks,
 * same best-effort philosophy as speakWithAvatar.
 */
export async function speakWithAvatarStreaming(text, { onChunk, onAudio } = {}) {
  const clean = stripMarkdown(text);
  if (!clean) return;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

  try {
    const response = await fetch(`${AVATAR_API_BASE}/api/speak/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: clean }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) return;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        const dataLine = event.split("\n").find((line) => line.startsWith("data:"));
        if (!dataLine) continue;

        let payload;
        try {
          payload = JSON.parse(dataLine.slice(5).trim());
        } catch {
          continue;
        }

        // Server hit an error mid-stream: stop here and let whatever
        // chunks already arrived keep playing, rather than erroring the
        // whole clip out from under the user.
        if (payload.error) return;

        if (payload.audio_url) {
          onAudio?.(
            `${AVATAR_API_BASE}${payload.audio_url}`,
            Number(payload.chunk_seconds) || undefined,
          );
        }

        if (payload.video_url) {
          onChunk?.(
            `${AVATAR_API_BASE}${payload.video_url}`,
            Boolean(payload.is_last),
            {
              chunkIndex: payload.chunk_index,
              chunkStart: Number(payload.chunk_start) || 0,
              chunkDuration:
                payload.chunk_duration != null
                  ? Number(payload.chunk_duration)
                  : undefined,
            },
          );
        }
      }
    }
  } catch {
    // best-effort, same as speakWithAvatar
  } finally {
    window.clearTimeout(timeout);
  }
}

/**
 * Requests a lip-synced clip of `text` from the avatar service.
 * Returns the proxied video URL to play, or null if the avatar pipeline
 * isn't reachable right now (caller should just keep showing the idle image).
 */
export async function speakWithAvatar(text) {
  const clean = truncateForSpeech(stripMarkdown(text));
  if (!clean) return null;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), SPEAK_TIMEOUT_MS);

  try {
    const response = await fetch(`${AVATAR_API_BASE}/api/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: clean }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const { video_url } = await response.json();
    if (!video_url) return null;

    // video_url comes back as an assestant-relative path (e.g.
    // "/avatar-video/xyz.mp4"); route it through the same proxy.
    return `${AVATAR_API_BASE}${video_url}`;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}
