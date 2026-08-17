import api from "./api";

export const mediaFolderService = {
  list: () => api.get("/media-folders"),
  create: (payload) => api.post("/media-folders", payload),
  update: (id, payload) => api.put(`/media-folders/${id}`, payload),
  remove: (id) => api.delete(`/media-folders/${id}`),
};