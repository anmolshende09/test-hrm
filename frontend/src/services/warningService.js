import api from "./api";

export const warningService = {
  list: (params) => api.get("/warnings", { params }),

  create: (formData) =>
    api.post("/warnings", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id, formData) =>
    api.put(`/warnings/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  remove: (id) =>
    api.delete(`/warnings/${id}`),
};