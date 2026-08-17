import api from "./api";
export const payrollRunService = {
  list: (params) => api.get("/payroll-runs", { params }),
  create: (payload) => api.post("/payroll-runs", payload),
  update: (id, payload) => api.put(`/payroll-runs/${id}`, payload),
  remove: (id) => api.delete(`/payroll-runs/${id}`),
  export: (id) => api.get(`/payroll-runs/${id}/export`, { responseType: "blob" }),
};
