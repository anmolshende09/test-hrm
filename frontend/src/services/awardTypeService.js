import api from "./api";

export const awardTypeService = {
  list: (params) => api.get("/award-types", { params }),
  create: (payload) => api.post("/award-types", payload),
  update: (id, payload) => api.put(`/award-types/${id}`, payload),
  remove: (id) => api.delete(`/award-types/${id}`),
};
