import api from "./api";

export const employeeService = {
  list: (params) => api.get("/employees", { params }),
  statusCounts: (params) => api.get("/employees/status-counts", { params }),
  orgChart: () => api.get("/employees/org-chart"),
  get: (id) => api.get(`/employees/${id}`),
  create: (formData) =>
    api.post("/employees", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.put(`/employees/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  remove: (id) => api.delete(`/employees/${id}`),

  changePassword: (id, newPassword) => api.put(`/employees/${id}/password`, { newPassword }),
  toggleLoginStatus: (id) => api.put(`/employees/${id}/login-status`),

  exportCSV: (params) => api.get("/employees/export", { params, responseType: "blob" }),
  importCSV: (formData) =>
    api.post("/employees/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Documents & Certifications — used by the Employee Profile page (next phase)
  getDocuments: (id) => api.get(`/employees/${id}/documents`),
  uploadDocument: (id, formData) =>
    api.post(`/employees/${id}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  verifyDocument: (id, docId) => api.put(`/employees/${id}/documents/${docId}/verify`),
  deleteDocument: (id, docId) => api.delete(`/employees/${id}/documents/${docId}`),
  downloadCertificate: (id, type) => api.get(`/employees/${id}/certificates/${type}`, { responseType: "blob" }),
};
