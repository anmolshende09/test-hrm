import api from "./api";

export const shiftService = {
  list: (params) => api.get("/shifts", { params }),
  all: () => api.get("/shifts/all"),
  get: (id) => api.get(`/shifts/${id}`),
  create: (payload) => api.post("/shifts", payload),
  update: (id, payload) => api.put(`/shifts/${id}`, payload),
  remove: (id) => api.delete(`/shifts/${id}`),
};
