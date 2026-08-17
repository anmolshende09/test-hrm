import api from "./api";
export const assetService = {
  list: (params) => api.get("/assets", { params }),
  get: (id) => api.get(`/assets/${id}`),
  create: (payload) => api.post("/assets", payload),
  update: (id, payload) => api.put(`/assets/${id}`, payload),
  remove: (id) => api.delete(`/assets/${id}`),
  assign: (id, payload) => api.put(`/assets/${id}/assign`, payload),
  returnAsset: (id) => api.put(`/assets/${id}/return`),
  scheduleMaintenance: (id, payload) => api.post(`/assets/${id}/maintenance`, payload),
  export: () => api.get("/assets/export", { responseType: "blob" }),
  dashboard: () => api.get("/assets/dashboard"),
  depreciation: (params) => api.get("/assets/depreciation", { params }),
  exportDepreciation: () => api.get("/assets/depreciation/export", { responseType: "blob" }),
};
