import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "../components/ui";
import { getProfile, updateProfile, changePassword } from "../api/profile.api";
import {
  UserIcon,
  CheckIcon,
  ArrowLeftIcon,
} from "../components/ui/Icons";

// ─── Small inline icons not yet in the shared set ───────────────────────────
function MailIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ImageIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function SpinnerIcon({ className }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function EyeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ─── Avatar Component ────────────────────────────────────────────────────────
function Avatar({ username, profilePicture, size = "lg" }) {
  const [imgError, setImgError] = useState(false);
  const initials = username ? username.slice(0, 2).toUpperCase() : "?";
  const sizeClasses = size === "lg"
    ? "w-24 h-24 text-3xl"
    : "w-16 h-16 text-xl";

  if (profilePicture && !imgError) {
    return (
      <img
        src={profilePicture}
        alt={username}
        onError={() => setImgError(true)}
        className={`${sizeClasses} rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/20`}
      />
    );
  }

  return (
    <div className={`${sizeClasses} rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20`}>
      {initials}
    </div>
  );
}

// ─── Field wrapper ───────────────────────────────────────────────────────────
function FieldGroup({ icon, label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-indigo-400">{icon}</span>
        <span className="text-sm font-medium text-slate-300">{label}</span>
      </div>
      {children}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function EditProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);   // page load
  const [saving, setSaving] = useState(false);     // form submit
  const [fetchError, setFetchError] = useState(""); // load error

  const [form, setForm] = useState({
    username: "",
    email: "",
    profilePicture: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [serverError, setServerError] = useState("");

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordServerError, setPasswordServerError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Pre-fill form on mount
  useEffect(() => {
    getProfile()
      .then(({ user }) => {
        setForm({
          username: user.username || "",
          email: user.email || "",
          profilePicture: user.profilePicture || "",
        });
      })
      .catch(() => {
        setFetchError("Failed to load profile. Please refresh the page.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Clear messages when user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMsg("");
    setServerError("");
  };

  // Client-side validation
  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    } else if (form.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (form.profilePicture && !/^https?:\/\/.+/.test(form.profilePicture.trim())) {
      newErrors.profilePicture = "Must be a valid URL starting with http:// or https://";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setServerError("");
    setSuccessMsg("");

    try {
      const { user } = await updateProfile({
        username: form.username.trim(),
        email: form.email.trim(),
        profilePicture: form.profilePicture.trim(),
      });
      // Sync updated values into form
      setForm({
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || "",
      });
      setSuccessMsg("Profile updated successfully!");
      // Notify Navbar to refresh user info
      window.dispatchEvent(new Event("user-login"));
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Password change handlers ──
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    setPasswordSuccess("");
    setPasswordServerError("");
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validatePassword();
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }

    setSavingPassword(true);
    setPasswordServerError("");
    setPasswordSuccess("");

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordSuccess("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      setPasswordServerError(err.message || "Failed to change password. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <SpinnerIcon className="w-8 h-8 text-indigo-500" />
          <p className="text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  // ── Fatal error ──
  if (fetchError) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 px-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center max-w-sm">
          <p className="text-red-400">{fetchError}</p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 py-12 px-4 sm:px-6">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Update your account information</p>
        </div>

        {/* Main card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">

          {/* Avatar header banner */}
          <div className="bg-linear-to-r from-indigo-900/40 to-purple-900/40 border-b border-slate-700/50 px-6 py-8 sm:px-8">
            <div className="flex items-center gap-5 sm:gap-6">
              <Avatar username={form.username} profilePicture={form.profilePicture} />
              <div>
                <h2 className="text-lg font-semibold text-white">{form.username || "—"}</h2>
                <p className="text-slate-400 text-sm mt-0.5">{form.email || "—"}</p>
                <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Active member
                </span>
              </div>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} noValidate className="px-6 py-8 sm:px-8 space-y-6">

            {/* Success banner */}
            {successMsg && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm">
                <CheckIcon className="w-4 h-4 shrink-0" />
                {successMsg}
              </div>
            )}

            {/* Server error banner */}
            {serverError && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                <span className="shrink-0 mt-0.5">⚠</span>
                {serverError}
              </div>
            )}

            {/* Fields */}
            <FieldGroup icon={<UserIcon className="w-4 h-4" />} label="Username">
              <Input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="Your display name"
                error={errors.username}
                autoComplete="username"
              />
            </FieldGroup>

            <FieldGroup icon={<MailIcon className="w-4 h-4" />} label="Email Address">
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={errors.email}
                autoComplete="email"
              />
            </FieldGroup>

            <FieldGroup icon={<ImageIcon className="w-4 h-4" />} label="Profile Picture URL (optional)">
              <Input
                id="profilePicture"
                name="profilePicture"
                type="url"
                value={form.profilePicture}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
                error={errors.profilePicture}
                autoComplete="off"
              />
              {form.profilePicture && !errors.profilePicture && (
                <p className="text-xs text-slate-500 mt-1">
                  Preview updates as you type above.
                </p>
              )}
            </FieldGroup>

            {/* Divider */}
            <div className="border-t border-slate-700/50" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                className="sm:flex-1"
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <SpinnerIcon className="w-4 h-4" />
                    Saving…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckIcon className="w-4 h-4" />
                    Save Changes
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Change Password Section */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="mt-8 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Section header */}
          <div className="bg-slate-800/40 border-b border-slate-700/50 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <LockIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Change Password</h2>
                <p className="text-slate-400 text-xs mt-0.5">Update your password to keep your account secure</p>
              </div>
            </div>
          </div>

          {/* Password form */}
          <form onSubmit={handlePasswordSubmit} noValidate className="px-6 py-8 sm:px-8 space-y-6">

            {/* Success banner */}
            {passwordSuccess && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm">
                <CheckIcon className="w-4 h-4 shrink-0" />
                {passwordSuccess}
              </div>
            )}

            {/* Server error banner */}
            {passwordServerError && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                <span className="shrink-0 mt-0.5">⚠</span>
                {passwordServerError}
              </div>
            )}

            {/* Current Password */}
            <FieldGroup icon={<LockIcon className="w-4 h-4" />} label="Current Password">
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  error={passwordErrors.currentPassword}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                >
                  {showCurrentPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </FieldGroup>

            {/* New Password */}
            <FieldGroup icon={<LockIcon className="w-4 h-4" />} label="New Password">
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  error={passwordErrors.newPassword}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                >
                  {showNewPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </FieldGroup>

            {/* Confirm Password */}
            <FieldGroup icon={<LockIcon className="w-4 h-4" />} label="Confirm New Password">
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  error={passwordErrors.confirmPassword}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </FieldGroup>

            {/* Security hint */}
            <div className="flex items-start gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3 text-slate-400 text-xs">
              <span className="shrink-0 mt-0.5">💡</span>
              <span>Choose a strong password with at least 8 characters. Include a mix of letters, numbers, and symbols for better security.</span>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto"
                disabled={savingPassword}
              >
                {savingPassword ? (
                  <span className="flex items-center justify-center gap-2">
                    <SpinnerIcon className="w-4 h-4" />
                    Changing Password…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LockIcon className="w-4 h-4" />
                    Change Password
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Metadata footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Your information is stored securely and never shared with third parties.
        </p>
      </div>
    </div>
  );
}
