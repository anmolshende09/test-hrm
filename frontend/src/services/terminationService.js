import api from "./api";

export const terminationService = {
  list: (params) => api.get("/terminations", { params }),
  create: (formData) => api.post("/terminations", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) => api.put("/terminations/${id}", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete("/terminations/${id}"),
};
