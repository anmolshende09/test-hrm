import api from "./api";

export const holidayService = {
  list: (params) => api.get("/holidays", { params }),
  get: (id) => api.get(`/holidays/${id}`),
  create: (payload) => api.post("/holidays", payload),
  update: (id, payload) => api.put(`/holidays/${id}`, payload),
  remove: (id) => api.delete(`/holidays/${id}`),
  exportPDF: () => api.get("/holidays/export/pdf", { responseType: "blob" }),
  exportICal: () => api.get("/holidays/export/ical", { responseType: "blob" }),
};
