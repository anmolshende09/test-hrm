import api from "./api";

export const dashboardService = {
  getDashboard: () => api.get("/dashboard"),
  getHiringTrend: (year) => api.get("/dashboard/hiring-trend", { params: { year } }),
  getPayrollTrend: (year) => api.get("/dashboard/payroll-trend", { params: { year } }),
};
