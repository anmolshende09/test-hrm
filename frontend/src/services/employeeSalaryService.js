import api from "./api";
export const employeeSalaryService = {
  list: (params) => api.get("/employee-salaries", { params }),
  get: (id) => api.get(`/employee-salaries/${id}`),
  create: (payload) => api.post("/employee-salaries", payload),
  update: (id, payload) => api.put(`/employee-salaries/${id}`, payload),
  remove: (id) => api.delete(`/employee-salaries/${id}`),
};
