import api from "./api";

export const resignationService = {
  list: (params) => api.get("/resignations", { params }),
  create: (formData) => api.post("/resignations", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) => api.put("/resignations/${id}", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete("/resignations/${id}"),
};
