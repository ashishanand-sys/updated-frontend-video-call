import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../ui";
import { LogOutIcon, UserIcon, VideoIcon } from "../ui/Icons";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on meeting pages
  const isMeetingPage = location.pathname.startsWith("/stream/");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/profile`,
          {
            credentials: "include",
          }
        );

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    checkUser();

    // Listen for login events
    const onLogin = () => checkUser();
    window.addEventListener("user-login", onLogin);
    return () => window.removeEventListener("user-login", onLogin);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (err) {
      console.error(err);
    }

    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (isMeetingPage) return null;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <VideoIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-white to-slate-300 bg-clip-text text-transparent">
              MeetFlow
            </span>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* User info — click to go to profile */}
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-200 group"
                >
                  <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center overflow-hidden">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                      <UserIcon className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    {user.username}
                  </span>
                </Link>

                {/* Logout */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-400"
                >
                  <LogOutIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
