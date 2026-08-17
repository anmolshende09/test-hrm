import api from "./api";

export const branchService = {
  list: (params) => api.get("/branches", { params }),
  all: () => api.get("/branches/all"),
  get: (id) => api.get(`/branches/${id}`),
  create: (payload) => api.post("/branches", payload),
  update: (id, payload) => api.put(`/branches/${id}`, payload),
  remove: (id) => api.delete(`/branches/${id}`),
};
