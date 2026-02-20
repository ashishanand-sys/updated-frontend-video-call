import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white">
      <Link
        to="/"
        className="text-xl font-bold hover:text-blue-400 transition"
      >
        📹 Live Stream
      </Link>

      {user ? (
        <div className="flex items-center gap-6">
          <span>
            Welcome, <strong>{user.username}</strong>
          </span>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link
            to="/login"
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}