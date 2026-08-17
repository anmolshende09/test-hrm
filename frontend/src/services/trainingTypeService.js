import api from "./api";

export const trainingTypeService = {
  list: (params) => api.get("/training-types", { params }),
  all: () => api.get("/training-types/all"),
  get: (id) => api.get(`/training-types/${id}`),
  create: (payload) => api.post("/training-types", payload),
  update: (id, payload) => api.put(`/training-types/${id}`, payload),
  remove: (id) => api.delete(`/training-types/${id}`),
};
