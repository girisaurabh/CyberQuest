const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || "Something went wrong.");
  return data;
}

export const api = {
  signup: (payload) => request("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),
  dashboard: () => request("/api/dashboard"),
  journey: () => request("/api/journey"),
  missions: () => request("/api/missions"),
  mission: (missionId) => request(`/api/missions/${missionId}`),
  completeMission: (missionId) => request(`/api/missions/${missionId}/complete`, { method: "POST" }),
  rewards: () => request("/api/rewards"),
  skills: () => request("/api/skills"),
  profile: () => request("/api/profile"),
  updateProfile: (payload) => request("/api/profile", { method: "PATCH", body: JSON.stringify(payload) }),
  projects: () => request("/api/projects"),
  addProject: (payload) => request("/api/projects", { method: "POST", body: JSON.stringify(payload) }),
  sendPhoneCode: (phone) => request("/api/auth/phone/send", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyPhone: (payload) => request("/api/auth/phone/verify", { method: "POST", body: JSON.stringify(payload) }),
};
