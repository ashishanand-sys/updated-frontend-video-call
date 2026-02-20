import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PhoneOffIcon,
  CopyIcon,
  CheckIcon,
} from "../ui/Icons";

export default function ControlBar({
  isMicOn,
  isCamOn,
  copied,
  onToggleMic,
  onToggleCam,
  onCopy,
  onLeave,
}) {
  return (
    <div className="relative px-4 sm:px-6 py-4 sm:py-5">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/50" />

      <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
        {/* Mic Toggle */}
        <ControlButton
          active={isMicOn}
          onClick={onToggleMic}
          icon={isMicOn ? <MicIcon className="w-5 h-5" /> : <MicOffIcon className="w-5 h-5" />}
          label={isMicOn ? "Mute" : "Unmute"}
          activeColor="bg-slate-700/80 hover:bg-slate-600/80 border-slate-600/50"
          inactiveColor="bg-red-500/90 hover:bg-red-400/90 border-red-400/30"
        />

        {/* Camera Toggle */}
        <ControlButton
          active={isCamOn}
          onClick={onToggleCam}
          icon={isCamOn ? <VideoIcon className="w-5 h-5" /> : <VideoOffIcon className="w-5 h-5" />}
          label={isCamOn ? "Stop Video" : "Start Video"}
          activeColor="bg-slate-700/80 hover:bg-slate-600/80 border-slate-600/50"
          inactiveColor="bg-red-500/90 hover:bg-red-400/90 border-red-400/30"
        />

        {/* Divider */}
        <div className="w-px h-8 bg-slate-700/50 mx-1 hidden sm:block" />

        {/* Copy Link */}
        <ControlButton
          active={true}
          onClick={onCopy}
          icon={copied ? <CheckIcon className="w-5 h-5 text-emerald-400" /> : <CopyIcon className="w-5 h-5" />}
          label={copied ? "Copied!" : "Copy Link"}
          activeColor={copied ? "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30" : "bg-slate-700/80 hover:bg-slate-600/80 border-slate-600/50"}
        />

        {/* Divider */}
        <div className="w-px h-8 bg-slate-700/50 mx-1 hidden sm:block" />

        {/* Leave Call */}
        <button
          onClick={onLeave}
          className="flex items-center gap-2 px-5 sm:px-8 py-3 rounded-full font-semibold text-sm
            bg-red-600 hover:bg-red-500 text-white
            shadow-lg shadow-red-500/20 hover:shadow-red-500/30
            border border-red-500/30
            transition-all duration-200 cursor-pointer"
        >
          <PhoneOffIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
}

function ControlButton({ active, onClick, icon, label, activeColor, inactiveColor }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full
        text-white border transition-all duration-200 cursor-pointer
        ${active ? activeColor : inactiveColor}`}
      title={label}
    >
      {icon}

      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-800 text-xs text-white rounded-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap
        border border-slate-700/50 shadow-lg">
        {label}
      </span>
    </button>
  );
}
