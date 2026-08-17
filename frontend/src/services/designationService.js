import api from "./api";

export const designationService = {
  list: (params) => api.get("/designations", { params }),
  all: (department) => api.get("/designations/all", { params: department ? { department } : {} }),
  get: (id) => api.get(`/designations/${id}`),
  create: (payload) => api.post("/designations", payload),
  update: (id, payload) => api.put(`/designations/${id}`, payload),
  remove: (id) => api.delete(`/designations/${id}`),
};
