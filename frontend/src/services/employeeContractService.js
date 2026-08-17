import api from "./api";

export const employeeContractService = {
  list: (params) => api.get("/employee-contracts", { params }),
  get: (id) => api.get(`/employee-contracts/${id}`),
  create: (payload) => api.post("/employee-contracts", payload),
  update: (id, payload) => api.put(`/employee-contracts/${id}`, payload),
  approve: (id) => api.put(`/employee-contracts/${id}/approve`),
  renew: (id, payload) => api.put(`/employee-contracts/${id}/renew`, payload),
  addAmendment: (id, payload) => api.post(`/employee-contracts/${id}/amendments`, payload),
  remove: (id) => api.delete(`/employee-contracts/${id}`),
};