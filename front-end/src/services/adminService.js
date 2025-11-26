import api from "./api";

export const adminService = {
  getTotalUsers: async (filters = {}) => {
    const res = await api.get("/admin/dashboard/total-users", {
      params: filters,
    });
    return res.data?.data ?? res.data;
  },

  getTotalInstructors: async (filters = {}) => {
    const res = await api.get("/admin/dashboard/total-instructors", {
      params: filters,
    });
    return res.data?.data ?? res.data;
  },

  getTotalLearners: async (filters = {}) => {
    const res = await api.get("/admin/dashboard/total-learners", {
      params: filters,
    });
    return res.data?.data ?? res.data;
  },

  getTotalCourses: async (filters = {}) => {
    const res = await api.get("/admin/dashboard/total-courses", {
      params: filters,
    });
    return res.data?.data ?? res.data;
  },

  getTotalApprovedCourses: async (filters = {}) => {
    const res = await api.get("/admin/dashboard/total-approved-courses", {
      params: filters,
    });
    return res.data?.data ?? res.data;
  },

  getTotalPendingCourses: async (filters = {}) => {
    const res = await api.get("/admin/dashboard/total-pending-courses", {
      params: filters,
    });
    return res.data?.data ?? res.data;
  },

  getTotalPendingReports: async (filters = {}) => {
    const res = await api.get("/admin/dashboard/total-pending-reports", {
      params: filters,
    });
    return res.data?.data ?? res.data;
  },

  getMonthlyUserStatistics: async (yearOrFilters = {}) => {
    let year;
    let params = {};

    if (
      typeof yearOrFilters === "number" ||
      /^\d+$/.test(String(yearOrFilters))
    ) {
      year = Number(yearOrFilters);
      params = {};
    } else if (yearOrFilters && typeof yearOrFilters === "object") {
      year = yearOrFilters.year ?? new Date().getFullYear();
      // copy remaining filters to query params (exclude year because it's in path)
      params = { ...yearOrFilters };
      delete params.year;
    } else {
      year = new Date().getFullYear();
      params = {};
    }

    const res = await api.get(
      `/admin/dashboard/monthly-user-statistics/${year}`,
      {
        params,
      }
    );
    return res.data?.data ?? res.data;
  },

  getMonthlyRevenueStatistics: async (yearOrFilters = {}) => {
    let year;
    let params = {};

    if (
      typeof yearOrFilters === "number" ||
      /^\d+$/.test(String(yearOrFilters))
    ) {
      year = Number(yearOrFilters);
      params = {};
    } else if (yearOrFilters && typeof yearOrFilters === "object") {
      year = yearOrFilters.year ?? new Date().getFullYear();
      params = { ...yearOrFilters };
      delete params.year;
    } else {
      year = new Date().getFullYear();
      params = {};
    }

    const res = await api.get(
      `/admin/dashboard/monthly-revenue-statistics/${year}`,
      {
        params,
      }
    );
    return res.data?.data ?? res.data;
  },

  getTopPopularCourses: async (filters = {}) => {
    const res = await api.get("/admin/dashboard/top-popular-courses", {
      params: filters,
    });
    return res.data?.data ?? res.data;
  },
};

export default adminService;
