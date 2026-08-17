import api from "./api";

export const userService = {
  list: (params) => api.get("/users", { params }),
  get: (id) => api.get(`/users/${id}`),
  create: (payload) => api.post("/users", payload),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  updatePassword: (id, payload) => api.put(`/users/${id}/password`, payload),
  updateStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }),
  remove: (id) => api.delete(`/users/${id}`),
};
