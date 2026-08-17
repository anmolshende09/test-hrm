import api from "./api";
export const payslipService = {
  list: (params) => api.get("/payslips", { params }),
  get: (id) => api.get(`/payslips/${id}`),
};
