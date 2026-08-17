import api from "./api";

export const currencyService = {
  list: (params) => api.get("/currencies", { params }),

  get: (id) => api.get(`/currencies/${id}`),

  create: (payload) => api.post("/currencies", payload),

  update: (id, payload) => api.put(`/currencies/${id}`, payload),

  remove: (id) => api.delete(`/currencies/${id}`),
};