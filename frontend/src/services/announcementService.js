import api from "./api";

export const announcementService = {
  list: (params) => api.get("/announcements", { params }),
  get: (id) => api.get(`/announcements/${id}`),
  create: (formData) =>
    api.post("/announcements", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.put(`/announcements/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  remove: (id) => api.delete(`/announcements/${id}`),
};
