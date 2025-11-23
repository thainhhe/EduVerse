import api from "./api";

export const reportService = {
  createReport: (data) => api.post("/report", data),
  getMyReports: (userId) => api.get(`/report/my-reports/${userId}`),
  getRepportsByinstructor: (instructorId) =>
    api.get(`/report/assigned/${instructorId}`),
  getAllReportsByAdmin: () => api.get("/report/all"),
  updateReportStatus: (id, status) =>
    api.put(`/report/${id}/admin-update`, { status }),
};
