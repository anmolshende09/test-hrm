import api from "./api";

export const roleService = {
  list: (params) => api.get("/roles", { params }),
  get: (id) => api.get(`/roles/${id}`),
  permissionCatalog: () => api.get("/roles/permission-catalog"),
  create: (payload) => api.post("/roles", payload),
  update: (id, payload) => api.put(`/roles/${id}`, payload),
  remove: (id) => api.delete(`/roles/${id}`),
};
