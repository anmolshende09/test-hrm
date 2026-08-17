import api from "./api";
export const assetTypeService = {
  list: (params) => api.get("/asset-types", { params }),
  create: (payload) => api.post("/asset-types", payload),
  update: (id, payload) => api.put(`/asset-types/${id}`, payload),
  remove: (id) => api.delete(`/asset-types/${id}`),
};
