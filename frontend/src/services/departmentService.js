import api from "./api";

export const departmentService = {
  list: () => api.get("/departments"),
  get: (id) => api.get(`/departments/${id}`),
  create: (payload) => api.post("/departments", payload),
  update: (id, payload) => api.put(`/departments/${id}`, payload),
  remove: (id) => api.delete(`/departments/${id}`),
};
