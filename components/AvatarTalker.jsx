import { useEffect, useRef, useState } from "react";
import { AVATAR_IDLE_IMAGE } from "../lib/avatarChat";

/**
 * Shows the idle reference photo until `videoUrl` is set, then plays the
 * lip-synced clip once and falls back to idle again when it ends.
 */
const AvatarTalker = ({ videoUrl, speaking, size = "h-36 w-36 sm:h-48 sm:w-48 md:h-56 md:w-56" }) => {
  const videoRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!videoUrl) return;
    setShowVideo(true);
    videoRef.current?.play().catch(() => setShowVideo(false));
  }, [videoUrl]);

  return (
    <div
      className={`relative ${size} shrink-0 overflow-hidden rounded-full border-2 bg-black/30 ${
        speaking && !showVideo ? "border-accent animate-pulse" : "border-white/10"
      }`}
    >
      <img
        src={AVATAR_IDLE_IMAGE}
        alt="Assistant avatar"
        className={`h-full w-full object-cover transition-opacity ${
          showVideo ? "opacity-0" : "opacity-100"
        }`}
      />
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
          onEnded={() => setShowVideo(false)}
          onError={() => setShowVideo(false)}
          playsInline
        />
      )}
      {speaking && !showVideo && (
        <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-accent" />
      )}
    </div>
  );
};

export default AvatarTalker;
