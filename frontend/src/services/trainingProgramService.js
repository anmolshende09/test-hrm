import api from "./api";

export const trainingProgramService = {
  list: (params) => api.get("/training-programs", { params }),
  all: () => api.get("/training-programs/all"),
  statusCounts: (params) => api.get("/training-programs/status-counts", { params }),
  get: (id) => api.get(`/training-programs/${id}`),
  create: (payload) => api.post("/training-programs", payload),
  update: (id, payload) => api.put(`/training-programs/${id}`, payload),
  remove: (id) => api.delete(`/training-programs/${id}`),
};
