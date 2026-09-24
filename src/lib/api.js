const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong.");
  }

  return data;
}

export const api = {
  signup: (payload) => request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  login: (payload) => request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),
  dashboard: () => request("/api/dashboard"),
  missions: () => request("/api/missions"),
  completeMission: (missionId) => request(`/api/missions/${missionId}/complete`, { method: "POST" }),
};
