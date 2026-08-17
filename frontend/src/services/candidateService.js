import api from "./api";

export const candidateService = {
  list: (params) => api.get("/candidates", { params }),
  all: () => api.get("/candidates/all"),
  create: (payload) => api.post("/candidates", payload),
  update: (id, payload) => api.put(`/candidates/${id}`, payload),
  remove: (id) => api.delete(`/candidates/${id}`),
};
