import { useEffect, useRef, useState } from "react";
import { AVATAR_IDLE_IMAGE } from "../lib/avatarChat";

/**
 * Dual-slot muted video under one continuous master TTS wav.
 *
 * queue items: { url, chunkStart, chunkDuration?, chunkIndex? }
 * Playback waits until two chunks are buffered (or stream ends with one)
 * so GFPGAN's ~1:1 render pace rarely starves the client mid-sentence.
 * Master audio never pauses for a late chunk -- the last frame freezes
 * until the next mp4 arrives, then video seeks to audio.currentTime.
 * Slot swaps are hard cuts (no opacity fade) so the idle photo never
 * flashes between chunks.
 */
const AvatarTalker = ({
  queue = [],
  audioUrl = null,
  streamDone = true,
  speaking,
  size = "h-36 w-36 sm:h-48 sm:w-48 md:h-56 md:w-56",
  minBufferChunks = 2,
}) => {
  const slotRefs = [useRef(null), useRef(null)];
  const audioRef = useRef(null);
  const loadedUrls = useRef([null, null]);
  const prerolled = useRef([false, false]);
  const masterAudioStarted = useRef(false);
  const playbackComplete = useRef(false);

  const [frontSlot, setFrontSlot] = useState(0);
  const [playIndex, setPlayIndex] = useState(-1);
  const [showVideo, setShowVideo] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const frontSlotRef = useRef(frontSlot);
  const playIndexRef = useRef(playIndex);
  const queueRef = useRef(queue);
  const streamDoneRef = useRef(streamDone);
  const audioUrlRef = useRef(audioUrl);
  frontSlotRef.current = frontSlot;
  playIndexRef.current = playIndex;
  queueRef.current = queue;
  streamDoneRef.current = streamDone;
  audioUrlRef.current = audioUrl;

  const useMasterAudio = Boolean(audioUrl);
  const OVERLAP_SECONDS = 0.08;

  const debugEnabled =
    typeof window !== "undefined" &&
    window.localStorage?.getItem("avatarDebug") === "1";

  const chunkUrl = (item) => (typeof item === "string" ? item : item?.url);

  const chunkStartFor = (index, items = queueRef.current) => {
    const item = items[index];
    if (item && typeof item === "object" && Number.isFinite(item.chunkStart)) {
      return item.chunkStart;
    }
    return 0;
  };

  const findChunkIndexForTime = (time, items) => {
    if (!items.length) return -1;
    let best = 0;
    for (let i = 0; i < items.length; i += 1) {
      if (chunkStartFor(i, items) <= time + 0.02) best = i;
      else break;
    }
    return best;
  };

  const syncVideoToMasterAudio = (video, index) => {
    const audio = audioRef.current;
    if (!audio || !audioUrlRef.current || !video) return;
    const local = audio.currentTime - chunkStartFor(index);
    if (!Number.isFinite(local)) return;
    const clamped = Math.max(0, local);
    if (Math.abs(video.currentTime - clamped) > 0.05) {
      try {
        video.currentTime = clamped;
      } catch {
        // Ignore seek before metadata is ready.
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

  const finishPlayback = () => {
    playbackComplete.current = true;
    slotRefs[0].current?.pause();
    slotRefs[1].current?.pause();
    stopMasterAudio();
    setShowVideo(false);
    setPlayIndex(-1);
    setWaiting(false);
  };

  const canStartPlayback = (items, done) => {
    if (playbackComplete.current || items.length === 0) return false;
    if (items.length >= minBufferChunks) return true;
    return done && items.length >= 1;
  };

  // Load master wav as soon as it arrives (play starts with first video).
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

  // New question resets queue to [] -- clear playback state.
  useEffect(() => {
    if (queue.length !== 0) return;
    slotRefs[0].current?.pause();
    slotRefs[1].current?.pause();
    stopMasterAudio();
    playbackComplete.current = false;
    setPlayIndex(-1);
    setFrontSlot(0);
    setWaiting(false);
    setShowVideo(false);
    loadedUrls.current = [null, null];
    prerolled.current = [false, false];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue.length]);

  // Start once buffered; when waiting, jump to the chunk that matches the
  // still-running master audio clock (audio is never paused for waits).
  useEffect(() => {
    if (playbackComplete.current) return;

    if (playIndex === -1 && canStartPlayback(queue, streamDone)) {
      setPlayIndex(0);
      setShowVideo(true);
      setWaiting(false);
      return;
    }

    if (waiting && queue.length > 0) {
      const audio = audioRef.current;
      const time = audio?.currentTime ?? chunkStartFor(playIndex);
      const target = findChunkIndexForTime(time, queue);
      if (target > playIndex || (target === playIndex && playIndex + 1 < queue.length)) {
        const next = Math.max(target, playIndex + 1);
        if (next < queue.length) {
          setFrontSlot((s) => 1 - s);
          setPlayIndex(next);
          setWaiting(false);
        }
      }
    }
  }, [queue.length, playIndex, waiting, streamDone, minBufferChunks]);

  // If the stream ends while we're holding the last frame and master audio
  // already finished (or never started), tear down -- otherwise waiting can
  // stick after panel finally flips streamDone.
  useEffect(() => {
    if (!waiting || !streamDone || playbackComplete.current) return;
    const audio = audioRef.current;
    if (!useMasterAudio || !audio || audio.ended || audio.paused) {
      finishPlayback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waiting, streamDone, useMasterAudio]);

  // Drive the front slot for the current playIndex.
  useEffect(() => {
    if (playIndex === -1 || playIndex >= queue.length) return;
    const item = queue[playIndex];
    const url = chunkUrl(item);
    if (!url) return;

    const front = slotRefs[frontSlot].current;
    if (!front) return;

    if (loadedUrls.current[frontSlot] !== url) {
      front.src = url;
      loadedUrls.current[frontSlot] = url;
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playIndex, frontSlot, useMasterAudio]);

  // Preload next chunk into the hidden slot.
  useEffect(() => {
    const nextIndex = playIndex + 1;
    if (nextIndex >= queue.length) return;
    const url = chunkUrl(queue[nextIndex]);
    if (!url) return;
    const backSlot = 1 - frontSlot;
    const back = slotRefs[backSlot].current;
    if (!back) return;
    if (loadedUrls.current[backSlot] !== url) {
      back.pause();
      back.muted = true;
      back.src = url;
      loadedUrls.current[backSlot] = url;
      prerolled.current[backSlot] = false;
      back.load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playIndex, frontSlot, queue.length]);

  const handleTimeUpdate = (event) => {
    const front = event.target;
    if (!front.duration || Number.isNaN(front.duration)) return;
    if (front.duration - front.currentTime > OVERLAP_SECONDS) return;

    const currentFront = frontSlotRef.current;
    const currentIndex = playIndexRef.current;
    const currentQueue = queueRef.current;
    const backSlot = 1 - currentFront;
    if (prerolled.current[backSlot]) return;

    const expectedUrl = chunkUrl(currentQueue[currentIndex + 1]);
    if (!expectedUrl) return;
    if (loadedUrls.current[backSlot] !== expectedUrl) return;

    const back = slotRefs[backSlot].current;
    if (!back) return;

    prerolled.current[backSlot] = true;
    back.muted = true;
    if (back.currentTime > 0.01) back.currentTime = 0;
    back.play().catch(() => {
      prerolled.current[backSlot] = false;
    });
  };

  const handleEnded = () => {
    const currentFront = frontSlotRef.current;
    const currentIndex = playIndexRef.current;
    const currentQueue = queueRef.current;
    const master = Boolean(audioUrlRef.current);

    const outgoingSlot = currentFront;
    // Keep the last decoded frame visible while waiting -- do not hide video.
    slotRefs[outgoingSlot].current?.pause();
    prerolled.current[outgoingSlot] = false;

    const nextIndex = currentIndex + 1;
    if (nextIndex < currentQueue.length) {
      const incomingSlot = 1 - currentFront;
      const incoming = slotRefs[incomingSlot].current;
      const expectedUrl = chunkUrl(currentQueue[nextIndex]);

      if (incoming) {
        const overlapReady =
          prerolled.current[incomingSlot] &&
          loadedUrls.current[incomingSlot] === expectedUrl &&
          !incoming.paused;

        incoming.muted = master;

        if (!overlapReady) {
          incoming.pause();
          incoming.currentTime = 0;
        }

        if (master) {
          syncVideoToMasterAudio(incoming, nextIndex);
          if (incoming.paused) incoming.play().catch(() => {});
        } else {
          incoming.muted = false;
          if (incoming.paused) incoming.play().catch(() => {});
        }

        if (debugEnabled) {
          console.log(
            "[avatar-handoff]",
            expectedUrl?.split("/").pop(),
            overlapReady ? "overlap" : "cold-fallback",
            master ? "master-audio" : "chunk-audio",
          );
        }
      }
      setFrontSlot(incomingSlot);
      setPlayIndex(nextIndex);
    } else if (!streamDoneRef.current) {
      // Hold last frame; master audio keeps playing (no pause).
      setWaiting(true);
    } else if (master) {
      // Video caught the end before audio -- keep last frame until wav ends.
      setWaiting(true);
    } else {
      finishPlayback();
    }
  };

  const handleAudioEnded = () => {
    finishPlayback();
  };

  return (
    <div
      className={`relative ${size} shrink-0 overflow-hidden rounded-full border-2 bg-black/30 ${
        (speaking || waiting) && !showVideo ? "border-accent animate-pulse" : "border-white/10"
      }`}
    >
      <audio ref={audioRef} preload="auto" onEnded={handleAudioEnded} />
      <img
        src={AVATAR_IDLE_IMAGE}
        alt="Assistant avatar"
        className={`h-full w-full object-cover ${
          showVideo ? "opacity-0" : "opacity-100"
        }`}
      />
      {[0, 1].map((slot) => (
        <video
          key={slot}
          ref={slotRefs[slot]}
          style={{ willChange: "opacity" }}
          className={`absolute inset-0 h-full w-full object-cover ${
            showVideo && slot === frontSlot ? "opacity-100" : "opacity-0"
          }`}
          onEnded={slot === frontSlot ? handleEnded : undefined}
          onTimeUpdate={slot === frontSlot ? handleTimeUpdate : undefined}
          onError={
            slot === frontSlot
              ? () => {
                  // Stay on last good frame if possible; never flash idle mid-stream.
                  if (streamDoneRef.current && !audioRef.current) {
                    setShowVideo(false);
                  }
                }
              : undefined
          }
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
