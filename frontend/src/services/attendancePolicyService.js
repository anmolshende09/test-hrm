import api from "./api";

export const attendancePolicyService = {
  list: (params) => api.get("/attendance-policies", { params }),
  all: () => api.get("/attendance-policies/all"),
  create: (payload) => api.post("/attendance-policies", payload),
  update: (id, payload) => api.put(`/attendance-policies/${id}`, payload),
  remove: (id) => api.delete(`/attendance-policies/${id}`),
};
