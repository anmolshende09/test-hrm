import api from "./api";

export const offerService = {
  list: (params) => api.get("/offers", { params }),
  create: (payload) => api.post("/offers", payload),
  update: (id, payload) => api.put(`/offers/${id}`, payload),
  remove: (id) => api.delete(`/offers/${id}`),
};
