import api from "./api";

export const contractTemplateService = {
  list: (params) => api.get("/contract-templates", { params }),
  get: (id) => api.get(`/contract-templates/${id}`),
  create: (payload) => api.post("/contract-templates", payload),
  update: (id, payload) => api.put(`/contract-templates/${id}`, payload),
  generate: (id, payload) => api.post(`/contract-templates/${id}/generate`, payload),
  remove: (id) => api.delete(`/contract-templates/${id}`),
};