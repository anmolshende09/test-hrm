import api from "./api";

export const interviewService = {
  list: (params) => api.get("/interviews", { params }),
  create: (payload) => api.post("/interviews", payload),
  update: (id, payload) => api.put(`/interviews/${id}`, payload),
  remove: (id) => api.delete(`/interviews/${id}`),
};
