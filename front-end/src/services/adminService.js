import api from "./api";

export const adminService = {
  getTotalUsers: async () => {
    const res = await api.get("/admin/dashboard/total-users");
    return res.data?.data ?? res.data;
  },

  getTotalInstructors: async () => {
    const res = await api.get("/admin/dashboard/total-instructors");
    return res.data?.data ?? res.data;
  },

  getTotalLearners: async () => {
    const res = await api.get("/admin/dashboard/total-learners");
    return res.data?.data ?? res.data;
  },

  getTotalCourses: async () => {
    const res = await api.get("/admin/dashboard/total-courses");
    return res.data?.data ?? res.data;
  },

  getTotalApprovedCourses: async () => {
    const res = await api.get("/admin/dashboard/total-approved-courses");
    return res.data?.data ?? res.data;
  },

  getTotalPendingCourses: async () => {
    const res = await api.get("/admin/dashboard/total-pending-courses");
    return res.data?.data ?? res.data;
  },

  getTotalPendingReports: async () => {
    const res = await api.get("/admin/dashboard/total-pending-reports");
    return res.data?.data ?? res.data;
  },

  getMonthlyUserStatistics: async (year) => {
    const res = await api.get(
      `/admin/dashboard/monthly-user-statistics/${year}`
    );
    return res.data?.data ?? res.data;
  },

  getMonthlyRevenueStatistics: async (year) => {
    const res = await api.get(
      `/admin/dashboard/monthly-revenue-statistics/${year}`
    );
    return res.data?.data ?? res.data;
  },

  getTopPopularCourses: async () => {
    const res = await api.get("/admin/dashboard/top-popular-courses");
    return res.data?.data ?? res.data;
  },
};

export default adminService;
