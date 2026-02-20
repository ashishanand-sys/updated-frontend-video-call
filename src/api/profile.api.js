const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch the current user's profile.
 * @returns {Promise<{success: boolean, user: object}>}
 */
export const getProfile = async () => {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

/**
 * Update the current user's profile.
 * @param {{ username: string, email: string, profilePicture?: string }} data
 * @returns {Promise<{success: boolean, user: object}>}
 */
export const updateProfile = async (data) => {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Update failed");
  return json;
};

/**
 * Change the current user's password.
 * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} data
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const changePassword = async (data) => {
  const res = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Password change failed");
  return json;
};
