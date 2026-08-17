import api from "./api";

export const promotionService = {
  list: (params) => api.get("/promotions", { params }),
  create: (formData) => api.post("/promotions", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) => api.put("/promotions/${id}", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete("/promotions/${id}"),
};
