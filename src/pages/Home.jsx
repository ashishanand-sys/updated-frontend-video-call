import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import { Footer } from "../components/layout";
import {
  PlusIcon,
  LinkIcon,
  VideoIcon,
  ShieldIcon,
  UsersIcon,
  GlobeIcon,
} from "../components/ui/Icons";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState("");

  const createStream = () => {
    const streamId = crypto.randomUUID();
    navigate(`/stream/${streamId}?role=host`);
  };

  const joinStream = (e) => {
    e.preventDefault();
    if (joinId.trim()) {
      // Support both full URLs and bare IDs
      const id = joinId.includes("/stream/")
        ? joinId.split("/stream/")[1]?.split("?")[0]
        : joinId.trim();
      if (id) navigate(`/stream/${id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-950">
      {/* Hero Section */}
      <section className="flex-1 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-150 bg-indigo-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-100 h-100 bg-purple-500/8 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-0 w-75 h-75 bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Free &amp; Open Source
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Video meetings
                  <br />
                  <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    made simple
                  </span>
                </h1>

                <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                  Crystal-clear video calls powered by WebRTC. No downloads,
                  no installs — just click and connect with anyone, anywhere.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="xl" onClick={createStream}>
                  <PlusIcon className="w-5 h-5" />
                  New Meeting
                </Button>

                <form onSubmit={joinStream} className="flex gap-2">
                  <div className="relative">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value)}
                      placeholder="Enter meeting link or ID"
                      className="pl-10 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                        transition-all duration-200 backdrop-blur-sm w-full sm:w-64"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="lg"
                    disabled={!joinId.trim()}
                  >
                    Join
                  </Button>
                </form>
              </div>
            </div>

            {/* Right — Feature cards / visual */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Mock meeting window */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 shadow-2xl shadow-black/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="ml-2 text-xs text-slate-400 font-mono">MeetFlow — Live Session</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="aspect-video rounded-xl bg-linear-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/20 flex items-center justify-center"
                      >
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-400/30 to-purple-500/30 flex items-center justify-center">
                          <UsersIcon className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700/60 border border-slate-600/30" />
                    <div className="w-10 h-10 rounded-full bg-slate-700/60 border border-slate-600/30" />
                    <div className="w-10 h-10 rounded-full bg-red-500/60 border border-red-400/30" />
                  </div>
                </div>

                {/* Decorative gradient ring */}
                <div className="absolute -inset-4 bg-linear-to-r from-indigo-500/10 via-transparent to-purple-500/10 rounded-3xl blur-sm -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-20 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Everything you need for great meetings
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Professional-grade video conferencing with the tools your team needs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<VideoIcon className="w-6 h-6" />}
              title="HD Video & Audio"
              description="Crystal clear quality with adaptive bitrate streaming powered by WebRTC."
              gradient="from-indigo-500 to-blue-500"
            />
            <FeatureCard
              icon={<ShieldIcon className="w-6 h-6" />}
              title="Secure & Private"
              description="End-to-end encrypted connections. Your conversations stay between you."
              gradient="from-emerald-500 to-teal-500"
            />
            <FeatureCard
              icon={<GlobeIcon className="w-6 h-6" />}
              title="No Downloads"
              description="Works right in your browser. Share a link and start meeting instantly."
              gradient="from-purple-500 to-pink-500"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }) {
  return (
    <div className="group p-6 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 hover:bg-slate-800/50">
      <div
        className={`w-12 h-12 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
