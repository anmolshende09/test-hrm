import api from "./api";
export const salaryComponentService = {
  list: (params) => api.get("/salary-components", { params }),
  all: () => api.get("/salary-components/all"),
  create: (payload) => api.post("/salary-components", payload),
  update: (id, payload) => api.put(`/salary-components/${id}`, payload),
  remove: (id) => api.delete(`/salary-components/${id}`),
};
