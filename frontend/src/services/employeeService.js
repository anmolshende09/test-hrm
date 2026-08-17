import api from "./api";

export const employeeService = {
  list: (params) => api.get("/employees", { params }),
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
};
