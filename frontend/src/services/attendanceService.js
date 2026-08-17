import api from "./api";

export const attendanceService = {
  mark: (payload) => api.post("/attendance", payload),
  today: () => api.get("/attendance/today"),
  history: (employeeId, params) => api.get(`/attendance/history/${employeeId}`, { params }),
  percentage: (employeeId, params) => api.get(`/attendance/percentage/${employeeId}`, { params }),
  matrix: (params) => api.get("/attendance/matrix", { params }),
  summary: (params) => api.get("/attendance/summary", { params }),
  exportCSV: (params) => api.get("/attendance/export", { params, responseType: "blob" }),
  importCSV: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/attendance/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
