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

    getTotalEnrollments: async (filters = {}) => {
        const res = await api.get("/admin/dashboard/total-enrollments", {
            params: filters,
        });
        return res.data?.data ?? res.data;
    },

    getMonthlyUserStatistics: async (yearOrFilters = {}) => {
        let year;
        let params = {};

        if (typeof yearOrFilters === "number" || /^\d+$/.test(String(yearOrFilters))) {
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

        const res = await api.get(`/admin/dashboard/monthly-user-statistics/${year}`, {
            params,
        });
        return res.data?.data ?? res.data;
    },

    getMonthlyEnrollmentStatistics: async (yearOrFilters = {}) => {
        let year;
        let params = {};

        if (typeof yearOrFilters === "number" || /^\d+$/.test(String(yearOrFilters))) {
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

        const res = await api.get(`/admin/dashboard/monthly-enrollment-statistics/${year}`, {
            params,
        });
        return res.data?.data ?? res.data;
    },

    getTotalRevenue: async (filters = {}) => {
        const res = await api.get("/admin/dashboard/total-revenue", {
            params: filters,
        });
        return res.data?.data ?? res.data;
    },

    getMonthlyRevenueStatistics: async (yearOrFilters = {}) => {
        let year;
        let params = {};

        if (typeof yearOrFilters === "number" || /^\d+$/.test(String(yearOrFilters))) {
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

        const res = await api.get(`/admin/dashboard/monthly-revenue-statistics/${year}`, {
            params,
        });
        return res.data?.data ?? res.data;
    },

    getTopPopularCourses: async (filters = {}) => {
        const res = await api.get("/admin/dashboard/top-popular-courses", {
            params: filters,
        });
        return res.data?.data ?? res.data;
    },

    getTopLearners: async (filters = {}) => {
        const res = await api.get("/admin/dashboard/top-learners", {
            params: filters,
        });
        return res.data?.data ?? res.data;
    },

    getTopRevenueCourses: async (filters = {}) => {
        const res = await api.get("/admin/dashboard/top-revenue-courses", {
            params: filters,
        });
        return res.data?.data ?? res.data;
    },

    getTopRevenueInstructors: async (filters = {}) => {
        const res = await api.get("/admin/dashboard/top-revenue-instructors", {
            params: filters,
        });
        return res.data?.data ?? res.data;
    },

    getInstructorRevenueList: async (filters = {}) => {
        const res = await api.get("/admin/dashboard/instructor-revenue-list", {
            params: filters,
        });
        return res?.data;
    },

    getInstructorCourseRevenue: async (instructorId, filters = {}) => {
        const res = await api.get(`/admin/dashboard/instructor-course-revenue/${instructorId}`, {
            params: filters,
        });
        return res.data?.data ?? res.data;
    },

    getSystemSettings: async () => {
        const res = await api.get("/admin/system/settings");
        return res.data?.data ?? res.data;
    },

    updateSystemSettings: async (data) => {
        const isFormData = data instanceof FormData;
        const res = await api.put("/admin/system/settings", data, {
            headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
        });
        return res.data?.data ?? res.data;
    },
    getTopPopularCourses: async (filters = {}) => {
        const res = await api.get("/admin/dashboard/top-popular-courses", {
            params: filters,
        });
        return res.data?.data ?? res.data;
    },

    // Chat history admin APIs
    getChatHistories: async ({ limit = 20, skip = 0, search = "" } = {}) => {
        const res = await api.get("/chat/history", {
            params: { limit, skip, search },
        });
        return res.data?.data ?? res.data;
    },

    getChatHistory: async (userId) => {
        const res = await api.get(`/chat/history/${userId}`);
        return res.data?.data ?? res.data;
    },

    clearChatHistory: async (userId) => {
        const res = await api.post(`/chat/history/${userId}/clear`);
        return res.data?.data ?? res.data;
    },

    deleteChatHistory: async (userId) => {
        const res = await api.delete(`/chat/history/${userId}`);
        return res.data?.data ?? res.data;
    },
};

export default adminService;
