import api from "./api";

export const mediaFileService = {
  list: (params) => api.get("/media-files", { params }),
  stats: () => api.get("/media-files/stats"),
  upload: (formData) =>
    api.post("/media-files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, payload) => api.put(`/media-files/${id}`, payload),
  remove: (id) => api.delete(`/media-files/${id}`),
};