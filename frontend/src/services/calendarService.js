import api from "./api";

export const calendarService = {
  list: (from, to) => api.get("/calendar", { params: { from, to } }),
  create: (payload) => api.post("/calendar", payload),
  update: (id, payload) => api.put(`/calendar/${id}`, payload),
  remove: (id) => api.delete(`/calendar/${id}`),
};
