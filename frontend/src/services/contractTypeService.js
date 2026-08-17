import api from "./api";

export const contractTypeService = {
  list: (params) => api.get("/contract-types", { params }),
  all: () => api.get("/contract-types/all"),
  create: (payload) => api.post("/contract-types", payload),
  update: (id, payload) => api.put(`/contract-types/${id}`, payload),
  remove: (id) => api.delete(`/contract-types/${id}`),
};