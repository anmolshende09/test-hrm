import api from "./api";

export const settingsService = {
  get: () => api.get("/settings"),
  updateSystem: (payload) => api.put("/settings/system", payload),
  updateBrand: (formData) =>
    api.put("/settings/brand", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  removeBrandAsset: (field) => api.delete(`/settings/brand/${field}`),
  updateEmail: (payload) => api.put("/settings/email", payload),
  sendTestEmail: (testRecipient) => api.post("/settings/email/test", { testRecipient }),
  updateWorkingDays: (payload) => api.put("/settings/working-days", payload),
  updateStorage: (payload) => api.put("/settings/storage", payload),
};
