import { useEffect, useRef } from "react";
import { MicIcon, MicOffIcon } from "../ui/Icons";

export default function VideoPlayer({
  stream,
  muted = false,
  username = "Guest",
  isLocal = false,
  isMuted = false,        // optional: show muted indicator
  isSpeaking = false,     // optional: highlight ring when speaking
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={`
        relative w-full h-full group rounded-2xl overflow-hidden bg-slate-800
        shadow-lg shadow-black/20 border transition-all duration-300
        ${isSpeaking
          ? "border-emerald-400/60 shadow-emerald-400/20 ring-2 ring-emerald-400/40"
          : "border-slate-700/30 hover:border-indigo-500/40 hover:shadow-indigo-500/10"
        }
      `}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`absolute inset-0 w-full h-full object-cover ${isLocal ? "scale-x-[-1]" : ""}`}
      />

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

      {/* Username badge — bottom-left */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-600/30">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-emerald-400 animate-pulse" : "bg-emerald-400/60"}`} />
          <span className="text-xs font-medium text-white truncate max-w-30">
            {isLocal ? `${username} (You)` : username}
          </span>
        </div>

        {/* Muted indicator */}
        {isMuted && (
          <div className="flex items-center justify-center w-7 h-7 bg-red-500/80 backdrop-blur-md rounded-lg border border-red-400/30">
            <MicOffIcon className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      {/* "YOU" corner badge for local user */}
      {isLocal && (
        <div className="absolute top-3 right-3 bg-indigo-500/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
          You
        </div>
      )}
    </div>
  );
}
