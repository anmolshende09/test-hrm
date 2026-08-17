import api from "./api";

export const leaveService = {
  list: (params) => api.get("/leaves", { params }),
  get: (id) => api.get(`/leaves/${id}`),
  apply: (payload) => api.post("/leaves", payload),
  review: (id, payload) => api.put(`/leaves/${id}/review`, payload),
};
