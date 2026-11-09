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
 * This went through two bad versions before this one, both from the same
 * root cause: the "show the current chunk" effect depended on the `queue`
 * array (or queue.length) -- which changes on EVERY chunk arrival, not just
 * when there's actually a new chunk to show -- so it kept re-calling
 * play() on an already-playing element every ~4s. A redundant play() racing
 * one still in flight rejects with a benign AbortError, and treating that
 * as fatal (a .catch(() => setShowVideo(false)), reasonable-looking in
 * isolation) permanently hid the video for the rest of the stream even
 * though playback never actually stopped underneath -- OR, if the catch
 * was removed, left both elements' play() calls racing and occasionally
 * both actively playing at once (audible overlap). The fix is two-fold:
 * the front-display effect only depends on [playIndex, frontSlot] (real
 * transitions), not on queue growth, so it only fires when there's an
 * actual chunk change to show; and a failed play() is swallowed (onError
 * is the real signal for genuine failures), not treated as "hide forever".
 * Only the preload effect legitimately needs to react to queue growth (to
 * notice a newly-available next chunk), and it only ever calls load(),
 * never play(), so its extra reruns are harmless no-ops once loaded.
 *
 * `queue`: ordered, append-only array of chunk video URLs received so far.
 * `streamDone`: true once no more chunks are coming (last one already in
 *   queue, or the stream ended/errored) -- controls whether running out of
 *   queued chunks means "wait for more" (hold last frame, pulse) or "fall
 *   back to idle".
 */
const AvatarTalker = ({
  queue = [],
  streamDone = true,
  speaking,
  size = "h-36 w-36 sm:h-48 sm:w-48 md:h-56 md:w-56",
}) => {
  const slotRefs = [useRef(null), useRef(null)];
  // Tracks which URL is actually loaded into each slot's <video> right now.
  // Reading el.src back doesn't work for this: the browser resolves it to
  // an absolute URL, which never string-equals the relative path we assign.
  const loadedUrls = useRef([null, null]);

  const [frontSlot, setFrontSlot] = useState(0);
  const [playIndex, setPlayIndex] = useState(-1);
  const [showVideo, setShowVideo] = useState(false);
  const [waiting, setWaiting] = useState(false);

  // A fresh question resets the queue to [] before its first chunk arrives
  // -- reset local playback state so the new stream starts clean.
  useEffect(() => {
    if (queue.length === 0) {
      slotRefs[0].current?.pause();
      slotRefs[1].current?.pause();
      setPlayIndex(-1);
      setWaiting(false);
      loadedUrls.current = [null, null];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue.length]);

  // Start playback as soon as the first chunk arrives, and resume once a
  // chunk we were waiting on finally arrives. Both legitimately need to
  // react to queue growth.
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

  // Show whichever chunk playIndex/frontSlot currently point to. Deps are
  // [playIndex, frontSlot] only -- NOT queue -- so this only runs on an
  // actual transition, not on every chunk arrival (see the file docstring
  // for why that distinction is the whole fix). If it was already
  // preloaded into this slot (the common case after a swap), the tracked
  // URL already matches and this just calls play() -- no reload flash.
  useEffect(() => {
    if (playIndex === -1 || playIndex >= queue.length) return;
    const url = queue[playIndex];
    const front = slotRefs[frontSlot].current;
    if (!front) return;
    if (loadedUrls.current[frontSlot] !== url) {
      front.src = url;
      loadedUrls.current[frontSlot] = url;
    }
    // A rejected play() here is virtually always a benign AbortError from
    // an overlapping request, not a real failure -- onError is the signal
    // for genuine problems. Treating this as fatal is what caused the
    // video to get stuck hidden for the rest of a stream in an earlier
    // version, even though playback never actually stopped.
    front.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playIndex, frontSlot]);

  // Preload the next chunk (if already known) into the hidden slot. This
  // one legitimately needs queue.length in its deps, to notice newly
  // arrived chunks -- its extra reruns are harmless since it only ever
  // calls load(), never play(), and the loadedUrls guard makes repeat runs
  // a no-op once the target is already loaded.
  useEffect(() => {
    const nextIndex = playIndex + 1;
    if (nextIndex >= queue.length) return;
    const backSlot = 1 - frontSlot;
    const url = queue[nextIndex];
    const back = slotRefs[backSlot].current;
    if (!back) return;
    if (loadedUrls.current[backSlot] !== url) {
      back.pause(); // defensive: this slot must never be audible while hidden
      back.src = url;
      loadedUrls.current[backSlot] = url;
      back.load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playIndex, frontSlot, queue.length]);

  const handleEnded = () => {
    // Defensive: "ended" already means this slot stopped on its own, but
    // pause explicitly anyway so nothing can keep producing audio in the
    // background after a swap, regardless of how it got here.
    slotRefs[frontSlot].current?.pause();

    const nextIndex = playIndex + 1;
    if (nextIndex < queue.length) {
      setFrontSlot((s) => 1 - s);
      setPlayIndex(nextIndex);
    } else if (!streamDone) {
      // Next chunk hasn't rendered yet -- hold the last frame and wait;
      // the "resume" effect above picks it up once queue grows.
      setWaiting(true);
    } else {
      setShowVideo(false);
      setPlayIndex(-1);
    }
  };

  return (
    <div
      className={`relative ${size} shrink-0 overflow-hidden rounded-full border-2 bg-black/30 ${
        (speaking || waiting) && !showVideo ? "border-accent animate-pulse" : "border-white/10"
      }`}
    >
      <img
        src={AVATAR_IDLE_IMAGE}
        alt="Assistant avatar"
        className={`h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
          showVideo ? "opacity-0" : "opacity-100"
        }`}
      />
      {[0, 1].map((slot) => (
        <video
          key={slot}
          ref={slotRefs[slot]}
          // will-change hints the browser to promote this to its own
          // compositor layer ahead of time, instead of doing it reactively
          // when the opacity transition starts -- measured (via sampled
          // currentTime across a chunk swap) that compositing two
          // overlapping actively-decoding <video> elements during the fade
          // was stalling the incoming chunk's actual decode/playback to
          // roughly half real-time for ~400-450ms, which is what read as
          // "stops playing" -- a longer fade duration just gave that same
          // stall more visible runway. Shorter duration + this hint trades
          // some of the crossfade smoothness back for less stall.
          style={{ willChange: "opacity" }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out ${
            showVideo && slot === frontSlot ? "opacity-100" : "opacity-0"
          }`}
          onEnded={slot === frontSlot ? handleEnded : undefined}
          onError={slot === frontSlot ? () => setShowVideo(false) : undefined}
          playsInline
        />
      ))}
      {((speaking && !showVideo) || waiting) && (
        <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-accent animate-pulse" />
      )}
    </div>
  );
};

export default AvatarTalker;
