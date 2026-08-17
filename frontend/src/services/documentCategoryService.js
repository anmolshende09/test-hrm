import api from "./api";

export const documentCategoryService = {
  list: (params) => api.get("/document-categories", { params }),
  all: () => api.get("/document-categories/all"),
  create: (payload) => api.post("/document-categories", payload),
  update: (id, payload) => api.put(`/document-categories/${id}`, payload),
  remove: (id) => api.delete(`/document-categories/${id}`),
};