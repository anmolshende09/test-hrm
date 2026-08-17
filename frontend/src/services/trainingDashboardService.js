import api from "./api";

export const trainingDashboardService = {
  get: () => api.get("/training-dashboard"),
};
