import api from "./api";

export const documentTypeService = {
  list: (params) => api.get("/document-types", { params }),
  create: (payload) => api.post("/document-types", payload),
  update: (id, payload) => api.put(`/document-types/${id}`, payload),
  remove: (id) => api.delete(`/document-types/${id}`),
};
