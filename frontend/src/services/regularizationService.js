import api from "./api";

export const regularizationService = {
  list: (params) => api.get("/attendance-regularizations", { params }),
  create: (payload) => api.post("/attendance-regularizations", payload),
  review: (id, payload) => api.put(`/attendance-regularizations/${id}/review`, payload),
};
