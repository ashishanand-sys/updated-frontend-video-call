import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthLayout } from "../components/layout";
import { Card, Button } from "../components/ui";
import Input from "../components/ui/Input";
import { VideoIcon } from "../components/ui/Icons";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed");
      setLoading(false);
      return;
    }
    localStorage.setItem("user", JSON.stringify(data.user));

    window.dispatchEvent(new Event("user-login"));

    navigate(from, { replace: true });

  } catch (err) {
    setError(err.message || "Something went wrong");
    setLoading(false);
  }
};

  return (
    <AuthLayout>
      <Card glass className="w-full">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <VideoIcon className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-slate-400">
            Sign in to your MeetFlow account
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            state={{ from: location.state?.from }}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Create one free
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
