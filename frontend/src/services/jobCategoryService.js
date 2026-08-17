import api from "./api";

export const jobCategoryService = {
  list: (params) => api.get("/job-categories", { params }),
  all: () => api.get("/job-categories/all"),
  create: (payload) => api.post("/job-categories", payload),
  update: (id, payload) => api.put(`/job-categories/${id}`, payload),
  remove: (id) => api.delete(`/job-categories/${id}`),
};
