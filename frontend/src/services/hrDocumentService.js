import api from "./api";

export const hrDocumentService = {
  list: (params) => api.get("/hr-documents", { params }),
  get: (id) => api.get(`/hr-documents/${id}`),
  create: (formData) =>
    api.post("/hr-documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.put(`/hr-documents/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  approve: (id) => api.put(`/hr-documents/${id}/approve`),
  trackDownload: (id) => api.patch(`/hr-documents/${id}/download`),
  remove: (id) => api.delete(`/hr-documents/${id}`),
};