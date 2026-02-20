import { VideoIcon, UsersIcon } from "../ui/Icons";
import { Badge } from "../ui";

export default function MeetingHeader({ roomId, participantCount }) {
  return (
    <div className="relative px-4 sm:px-6 py-3">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50" />

      <div className="relative z-10 flex justify-between items-center">
        {/* Left — Brand + Room */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <VideoIcon className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <h3 className="text-sm font-semibold text-white leading-none mb-0.5">
              MeetFlow
            </h3>
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
              {roomId}
            </p>
          </div>
        </div>

        {/* Right — Live + Participants */}
        <div className="flex items-center gap-2.5">
          <Badge variant="live">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
            LIVE
          </Badge>

          <Badge variant="default">
            <UsersIcon className="w-3 h-3" />
            {participantCount}
          </Badge>
        </div>
      </div>
    </div>
  );
}
