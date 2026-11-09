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
 * Returns the transcribed text, or null if transcription failed/returned
 * nothing (caller should fall back to asking the user to type instead).
 */
export async function transcribeAudio(blob) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), SPEAK_TIMEOUT_MS);

  try {
    const form = new FormData();
    form.append("audio", blob, "recording.webm");

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

/**
 * Requests a lip-synced clip of `text` from the avatar service.
 * Returns the proxied video URL to play, or null if the avatar pipeline
 * isn't reachable right now (caller should just keep showing the idle image).
 */
export async function speakWithAvatar(text) {
  const clean = stripMarkdown(text);
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
