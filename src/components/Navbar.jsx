// components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const loadUser = useCallback(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (userData && token) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadUser(), 0);
    window.addEventListener("storage", loadUser);
    window.addEventListener("user-login", loadUser);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("user-login", loadUser);
    };
  }, [loadUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
