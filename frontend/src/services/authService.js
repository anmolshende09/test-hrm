import api from "./api";

export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (payload) => api.post("/auth/register", payload),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};
