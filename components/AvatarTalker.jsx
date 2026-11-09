import { useEffect, useRef, useState } from "react";
import { AVATAR_IDLE_IMAGE } from "../lib/avatarChat";

/**
 * Shows the idle reference photo until the first chunk in `queue` is ready,
 * then plays chunks back-to-back in order as they arrive, instead of
 * waiting for the whole clip to render. Two <video> elements are swapped
 * (rather than reusing one with a changing src) so the next chunk can be
 * preloaded into the hidden one while the current one plays -- avoids a
 * visible reload flash at chunk boundaries.
 *
 * Continuous speech: when `audioUrl` is set (full TTS wav from the stream),
 * a single <audio> element plays that track unbroken while video chunks
 * stay muted and only supply lip-sync. That way chunk boundaries never
 * stop the sentence -- only a late next-chunk (waiting) pauses audio so
 * lips stay locked. Without `audioUrl` (old server), videos keep their
 * own muxed audio as before.
 *
 * This went through two bad versions before this one, both from the same
 * root cause: the "show the current chunk" effect depended on the `queue`
 * array (or queue.length) -- which changes on EVERY chunk arrival, not just
 * when there's actually a new chunk to show -- so it kept re-calling
 * play() on an already-playing element every ~4s. A redundant play() racing
 * one still in flight rejects with a benign AbortError, and treating that
 * as fatal permanently hid the video for the rest of the stream. The fix
 * is two-fold: the front-display effect only depends on [playIndex,
 * frontSlot] (real transitions), not on queue growth; and a failed play()
 * is swallowed (onError is the real signal for genuine failures).
 *
 * Chunk-boundary stall (visual): short true overlap starts the next chunk
 * muted a few frames before the current one ends, then on ended we unmute
 * (legacy path) or keep muted (master-audio path) and reveal WITHOUT
 * pausing/seeking when overlap landed. Outgoing is paused first so the
 * opacity fade never composites two actively-decoding videos.
 *
 * `queue`: ordered, append-only array of chunk video URLs received so far.
 * `audioUrl`: optional full-utterance wav URL for continuous master audio.
 * `chunkSeconds`: nominal segment length; used to map audio clock -> chunk
 *   local time on swap (`audio.currentTime - playIndex * chunkSeconds`).
 * `streamDone`: true once no more chunks are coming -- controls whether
 *   running out of queued chunks means "wait for more" or "fall back to idle".
 */
const AvatarTalker = ({
  queue = [],
  audioUrl = null,
  chunkSeconds = null,
  streamDone = true,
  speaking,
  size = "h-36 w-36 sm:h-48 sm:w-48 md:h-56 md:w-56",
}) => {
  const slotRefs = [useRef(null), useRef(null)];
  const audioRef = useRef(null);
  // Tracks which URL is actually loaded into each slot's <video> right now.
  // Reading el.src back doesn't work for this: the browser resolves it to
  // an absolute URL, which never string-equals the relative path we assign.
  const loadedUrls = useRef([null, null]);
  // Tracks which slot has already started its muted overlap play for the
  // chunk it currently holds, so the warm-up only fires once per chunk
  // instead of on every timeupdate tick.
  const prerolled = useRef([false, false]);
  // True once we've kicked off the master audio for this stream (paired
  // with the first video play) so we don't restart it on every swap.
  const masterAudioStarted = useRef(false);

  const [frontSlot, setFrontSlot] = useState(0);
  const [playIndex, setPlayIndex] = useState(-1);
  const [showVideo, setShowVideo] = useState(false);
  const [waiting, setWaiting] = useState(false);

  // Event handlers close over render-time state; keep mirrors in refs so
  // timeupdate/ended always see the latest index/slot/queue.
  const frontSlotRef = useRef(frontSlot);
  const playIndexRef = useRef(playIndex);
  const queueRef = useRef(queue);
  const streamDoneRef = useRef(streamDone);
  const audioUrlRef = useRef(audioUrl);
  const chunkSecondsRef = useRef(chunkSeconds);
  frontSlotRef.current = frontSlot;
  playIndexRef.current = playIndex;
  queueRef.current = queue;
  streamDoneRef.current = streamDone;
  audioUrlRef.current = audioUrl;
  chunkSecondsRef.current = chunkSeconds;

  const useMasterAudio = Boolean(audioUrl);
  const OVERLAP_SECONDS = 0.08;

  const debugEnabled =
    typeof window !== "undefined" &&
    window.localStorage?.getItem("avatarDebug") === "1";

  const sampleSwap = (label, el) => {
    if (!debugEnabled || !el) return;
    const t0 = performance.now();
    const c0 = el.currentTime;
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      const dt = (performance.now() - t0) / 1000;
      const dc = el.currentTime - c0;
      const rate = dt > 0 ? dc / dt : 0;
      console.log(
        `[avatar-swap] ${label} t=${dt.toFixed(3)}s advanced=${dc.toFixed(3)}s rate=${rate.toFixed(2)} paused=${el.paused}`,
      );
      if (n >= 6) window.clearInterval(id);
    }, 50);
  };

  const chunkStartFor = (index) => {
    const seconds = chunkSecondsRef.current;
    return typeof seconds === "number" && seconds > 0 ? index * seconds : 0;
  };

  const syncVideoToMasterAudio = (video, index) => {
    const audio = audioRef.current;
    if (!audio || !audioUrlRef.current || !video) return;
    const local = audio.currentTime - chunkStartFor(index);
    if (Number.isFinite(local) && local >= 0) {
      // Only seek when meaningfully off -- tiny differences aren't worth
      // a decoder hitch, and overlap handoff already lands near the right spot.
      if (Math.abs(video.currentTime - local) > 0.05) {
        video.currentTime = local;
      }
    }
  };

  const stopMasterAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.removeAttribute("src");
    delete audio.dataset.loadedUrl;
    audio.load();
    masterAudioStarted.current = false;
  };

  // Load (but don't yet play) the master wav as soon as it arrives so the
  // first video play can start audio with minimal delay.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audioUrl) {
      stopMasterAudio();
      return;
    }
    if (audio.dataset.loadedUrl === audioUrl) return;
    audio.dataset.loadedUrl = audioUrl;
    audio.src = audioUrl;
    audio.load();
    masterAudioStarted.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  // A fresh question resets the queue to [] before its first chunk arrives
  // -- reset local playback state so the new stream starts clean.
  useEffect(() => {
    if (queue.length === 0) {
      slotRefs[0].current?.pause();
      slotRefs[1].current?.pause();
      stopMasterAudio();
      setPlayIndex(-1);
      setFrontSlot(0);
      setWaiting(false);
      setShowVideo(false);
      loadedUrls.current = [null, null];
      prerolled.current = [false, false];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue.length]);

  // Pause master audio while waiting on a late chunk; resume with the
  // video when the queue grows again (keeps lips locked to speech).
  useEffect(() => {
    if (!useMasterAudio) return;
    const audio = audioRef.current;
    if (!audio || !masterAudioStarted.current) return;
    if (waiting) {
      audio.pause();
    } else if (showVideo && audio.paused) {
      audio.play().catch(() => {});
    }
  }, [waiting, showVideo, useMasterAudio]);

  // Start playback as soon as the first chunk arrives, and resume once a
  // chunk we were waiting on finally arrives.
  useEffect(() => {
    if (playIndex === -1 && queue.length > 0) {
      setPlayIndex(0);
      setShowVideo(true);
      setWaiting(false);
    } else if (waiting && playIndex + 1 < queue.length) {
      setFrontSlot((s) => 1 - s);
      setPlayIndex((i) => i + 1);
      setWaiting(false);
    }
  }, [queue.length, playIndex, waiting]);

  // Show whichever chunk playIndex/frontSlot currently point to.
  useEffect(() => {
    if (playIndex === -1 || playIndex >= queue.length) return;
    const url = queue[playIndex];
    const front = slotRefs[frontSlot].current;
    if (!front) return;
    if (loadedUrls.current[frontSlot] !== url) {
      front.src = url;
      loadedUrls.current[frontSlot] = url;
    }
    // Master audio owns the voice; videos are always muted in that mode.
    // Legacy path keeps per-chunk muxed audio audible on the front slot.
    front.muted = useMasterAudio;

    if (front.paused) {
      front.play().catch(() => {});
    }

    if (useMasterAudio) {
      syncVideoToMasterAudio(front, playIndex);
      const audio = audioRef.current;
      if (audio && !masterAudioStarted.current) {
        masterAudioStarted.current = true;
        audio.currentTime = chunkStartFor(playIndex);
        audio.play().catch(() => {});
        if (debugEnabled) {
          console.log("[avatar-audio] start", audioUrl?.split("/").pop());
        }
      }
    }

    sampleSwap(url.split("/").pop() || url, front);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playIndex, frontSlot, useMasterAudio]);

  // Preload the next chunk into the hidden slot.
  useEffect(() => {
    const nextIndex = playIndex + 1;
    if (nextIndex >= queue.length) return;
    const backSlot = 1 - frontSlot;
    const url = queue[nextIndex];
    const back = slotRefs[backSlot].current;
    if (!back) return;
    if (loadedUrls.current[backSlot] !== url) {
      back.pause();
      back.muted = true; // hidden slot never audible; master audio or not
      back.src = url;
      loadedUrls.current[backSlot] = url;
      prerolled.current[backSlot] = false;
      back.load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playIndex, frontSlot, queue.length]);

  // Start the already-preloaded next chunk playing MUTED a few frames
  // before the front ends (visual decoder warm-up / overlap handoff).
  const handleTimeUpdate = (event) => {
    const front = event.target;
    if (!front.duration || Number.isNaN(front.duration)) return;
    if (front.duration - front.currentTime > OVERLAP_SECONDS) return;

    const currentFront = frontSlotRef.current;
    const currentIndex = playIndexRef.current;
    const currentQueue = queueRef.current;
    const backSlot = 1 - currentFront;
    if (prerolled.current[backSlot]) return;

    const expectedUrl = currentQueue[currentIndex + 1];
    if (!expectedUrl) return;
    if (loadedUrls.current[backSlot] !== expectedUrl) {
      if (debugEnabled) {
        console.warn(
          "[avatar-preroll] skip: back holds",
          loadedUrls.current[backSlot]?.split("/").pop(),
          "expected",
          expectedUrl.split("/").pop(),
        );
      }
      return;
    }

    const back = slotRefs[backSlot].current;
    if (!back) return;

    prerolled.current[backSlot] = true;
    back.muted = true;
    if (back.currentTime > 0.01) back.currentTime = 0;
    back.play().catch(() => {
      prerolled.current[backSlot] = false;
    });
    if (debugEnabled) {
      console.log(
        "[avatar-preroll] start",
        expectedUrl.split("/").pop(),
        `backSlot=${backSlot}`,
        `frontLeft=${(front.duration - front.currentTime).toFixed(3)}s`,
      );
    }
  };

  const handleEnded = () => {
    const currentFront = frontSlotRef.current;
    const currentIndex = playIndexRef.current;
    const currentQueue = queueRef.current;
    const master = Boolean(audioUrlRef.current);

    const outgoingSlot = currentFront;
    slotRefs[outgoingSlot].current?.pause();
    prerolled.current[outgoingSlot] = false;

    const nextIndex = currentIndex + 1;
    if (nextIndex < currentQueue.length) {
      const incomingSlot = 1 - currentFront;
      const incoming = slotRefs[incomingSlot].current;
      const expectedUrl = currentQueue[nextIndex];

      if (incoming) {
        const overlapReady =
          prerolled.current[incomingSlot] &&
          loadedUrls.current[incomingSlot] === expectedUrl &&
          !incoming.paused;

        // Always muted under master audio; legacy unmutes the front.
        incoming.muted = master;

        if (overlapReady) {
          // Leave playing -- no pause/seek. Resync to master clock below.
        } else {
          incoming.pause();
          incoming.currentTime = 0;
        }

        if (master) {
          syncVideoToMasterAudio(incoming, nextIndex);
          if (incoming.paused) incoming.play().catch(() => {});
        } else if (!overlapReady) {
          incoming.muted = false;
        } else {
          incoming.muted = false;
        }

        if (debugEnabled) {
          console.log(
            "[avatar-handoff]",
            expectedUrl?.split("/").pop(),
            overlapReady ? "overlap" : "cold-fallback",
            master ? "master-audio" : "chunk-audio",
            `t=${incoming.currentTime.toFixed(3)}`,
          );
        }
      }
      setFrontSlot(incomingSlot);
      setPlayIndex(nextIndex);
    } else if (!streamDoneRef.current) {
      // Next chunk hasn't rendered yet -- hold the last frame and wait.
      // The waiting effect pauses master audio; resume effect restarts it.
      setWaiting(true);
    } else {
      stopMasterAudio();
      setShowVideo(false);
      setPlayIndex(-1);
    }
  };

  const handleAudioEnded = () => {
    // Master track finished -- if video is somehow still going, tear down.
    if (streamDoneRef.current) {
      slotRefs[0].current?.pause();
      slotRefs[1].current?.pause();
      setShowVideo(false);
      setPlayIndex(-1);
      masterAudioStarted.current = false;
    }
  };

  return (
    <div
      className={`relative ${size} shrink-0 overflow-hidden rounded-full border-2 bg-black/30 ${
        (speaking || waiting) && !showVideo ? "border-accent animate-pulse" : "border-white/10"
      }`}
    >
      {/* Master TTS wav -- continuous sentence audio when streaming provides it. */}
      <audio ref={audioRef} preload="auto" onEnded={handleAudioEnded} />
      <img
        src={AVATAR_IDLE_IMAGE}
        alt="Assistant avatar"
        className={`h-full w-full object-cover transition-opacity duration-300 ease-out ${
          showVideo ? "opacity-0" : "opacity-100"
        }`}
      />
      {[0, 1].map((slot) => (
        <video
          key={slot}
          ref={slotRefs[slot]}
          // will-change: see prior notes -- promotes the layer ahead of the
          // opacity fade. Outgoing is paused before the fade so only one
          // decoder runs during the transition.
          style={{ willChange: "opacity" }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out ${
            showVideo && slot === frontSlot ? "opacity-100" : "opacity-0"
          }`}
          onEnded={slot === frontSlot ? handleEnded : undefined}
          onTimeUpdate={slot === frontSlot ? handleTimeUpdate : undefined}
          onError={slot === frontSlot ? () => setShowVideo(false) : undefined}
          playsInline
          muted={useMasterAudio}
        />
      ))}
      {((speaking && !showVideo) || waiting) && (
        <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-accent animate-pulse" />
      )}
    </div>
  );
};

export default AvatarTalker;
