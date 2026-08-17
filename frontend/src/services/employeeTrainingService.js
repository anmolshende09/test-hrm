import api from "./api";

export const employeeTrainingService = {
  list: (params) => api.get("/employee-trainings", { params }),
  statusCounts: (params) => api.get("/employee-trainings/status-counts", { params }),
  get: (id) => api.get(`/employee-trainings/${id}`),
  create: (formData) =>
    api.post("/employee-trainings", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.put(`/employee-trainings/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  bulkAssign: (payload) => api.post("/employee-trainings/bulk-assign", payload),
  remove: (id) => api.delete(`/employee-trainings/${id}`),
};
