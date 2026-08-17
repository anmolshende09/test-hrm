import api from "./api";

export const documentTemplateService = {
  list: (params) => api.get("/document-templates", { params }),
  get: (id) => api.get(`/document-templates/${id}`),
  create: (payload) => api.post("/document-templates", payload),
  update: (id, payload) => api.put(`/document-templates/${id}`, payload),
  generate: (id, payload) => api.post(`/document-templates/${id}/generate`, payload),
  remove: (id) => api.delete(`/document-templates/${id}`),
};