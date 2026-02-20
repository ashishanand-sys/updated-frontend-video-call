import { GlobeIcon, ShieldIcon, VideoIcon } from "../ui/Icons";

export default function Footer() {
  return (
    <footer className="bg-slate-900/50 border-t border-slate-800/50 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <VideoIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-300">MeetFlow</span>
          </div>

          {/* Features badges */}
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <ShieldIcon className="w-3.5 h-3.5 text-emerald-400" />
              End-to-end encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <GlobeIcon className="w-3.5 h-3.5 text-indigo-400" />
              Low latency
            </span>
          </div>

          {/* Copyright */}
          <p className="text-xs">
            &copy; {new Date().getFullYear()} MeetFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
