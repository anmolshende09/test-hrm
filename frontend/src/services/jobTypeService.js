import api from "./api";

export const jobTypeService = {
  list: (params) => api.get("/job-types", { params }),
  all: () => api.get("/job-types/all"),
  create: (payload) => api.post("/job-types", payload),
  update: (id, payload) => api.put(`/job-types/${id}`, payload),
  remove: (id) => api.delete(`/job-types/${id}`),
};
