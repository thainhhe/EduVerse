const DashboardRepository = require("../../repositories/admin/dashboard.repository");
const { system_enum } = require("../../config/enum/system.constant");
const { get } = require("mongoose");

const calculateDateRange = (filters = {}) => {
    const now = new Date();
    const period = (filters.period || "all").toLowerCase();
    const year = filters.year ? parseInt(filters.year, 10) : now.getFullYear();
    let startDate = null;
    let endDate = null;

    switch (period) {
        case "weekly": {
            // if filters.date provided, base week on that date; otherwise current date or first day of week
            const base = filters.date ? new Date(filters.date) : now;
            // compute Monday as start
            const day = base.getDay() === 0 ? 7 : base.getDay();
            startDate = new Date(base.getFullYear(), base.getMonth(), base.getDate() - day + 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
            endDate.setMilliseconds(endDate.getMilliseconds() - 1);
            break;
        }
        case "monthly": {
            const month = filters.month ? parseInt(filters.month, 10) : now.getMonth() + 1;
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        }
        case "quarterly": {
            const q = filters.quarter ? parseInt(filters.quarter, 10) : Math.floor((now.getMonth() + 3) / 3);
            const startMonth = (q - 1) * 3;
            startDate = new Date(year, startMonth, 1);
            endDate = new Date(year, startMonth + 3, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        }
        case "yearly": {
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31);
            endDate.setHours(23, 59, 59, 999);
            break;
        }
        case "all":
        default:
            startDate = null;
            endDate = null;
            break;
    }

    return { startDate, endDate };
};

const dashboardService = {
    getToitalUsers: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const totalUsers = await DashboardRepository.getTotalUsers({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Total users fetched successfully.",
                data: totalUsers,
            };
        } catch (error) {
            console.error("Error in getTotalUsers:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTotalInstructors: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const totalInstructors = await DashboardRepository.getTotalInstructors({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Total instructors fetched successfully.",
                data: totalInstructors,
            };
        } catch (error) {
            console.error("Error in getTotalInstructors:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTotalLearners: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const totalLearners = await DashboardRepository.getTotalLearners({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Total learners fetched successfully.",
                data: totalLearners,
            };
        } catch (error) {
            console.error("Error in getTotalLearners:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTotalCourses: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const totalCourses = await DashboardRepository.getTotalCourses({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Total courses fetched successfully.",
                data: totalCourses,
            };
        } catch (error) {
            console.error("Error in getTotalCourses:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTotalApprovedCourses: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const totalApprovedCourses = await DashboardRepository.getTotalApprovedCourses({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Total approved courses fetched successfully.",
                data: totalApprovedCourses,
            };
        } catch (error) {
            console.error("Error in getTotalApprovedCourses:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTotalPendingCourses: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const totalPendingCourses = await DashboardRepository.getTotalPendingCourses({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Total pending courses fetched successfully.",
                data: totalPendingCourses,
            };
        } catch (error) {
            console.error("Error in getTotalPendingCourses:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTotalPendingReports: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const totalPendingReports = await DashboardRepository.getTotalPendingReports({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Total pending reports fetched successfully.",
                data: totalPendingReports,
            };
        } catch (error) {
            console.error("Error in getTotalPendingReports:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTotalEnrollments: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const totalEnrollments = await DashboardRepository.getTotalEnrollments({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Total enrollments fetched successfully.",
                data: totalEnrollments,
            };
        } catch (error) {
            console.error("Error in getTotalEnrollments:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getMonthlyUserStatistics: async (year) => {
        try {
            const stats = await DashboardRepository.getMonthlyUserStatistics(year);
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Monthly user statistics fetched successfully.",
                data: stats,
            };
        } catch (error) {
            console.error("Error in getMonthlyUserStatistics:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getMonthlyEnrollmentStatistics: async (year) => {
        try {
            const stats = await DashboardRepository.getMonthlyEnrollmentStatistics(year);
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Monthly enrollment statistics fetched successfully.",
                data: stats,
            };
        } catch (error) {
            console.error("Error in getMonthlyEnrollmentStatistics:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTotalRevenue: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const totalRevenue = await DashboardRepository.getTotalRevenue({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Total revenue fetched successfully.",
                data: totalRevenue,
            };
        } catch (error) {
            console.error("Error in getTotalRevenue:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getMonthlyRevenueStatistics: async (year) => {
        try {
            const stats = await DashboardRepository.getMonthlyRevenueStatistics(year);
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Monthly revenue statistics fetched successfully.",
                data: stats,
            };
        } catch (error) {
            console.error("Error in getMonthlyRevenueStatistics:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getPopularCourses: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const courses = await DashboardRepository.getTopPopularCourses({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Top popular courses fetched successfully.",
                data: courses,
            };
        } catch (error) {
            console.error("Error in getPopularCourses:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTopLearners: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const learners = await DashboardRepository.getTopLearners({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Top learners fetched successfully.",
                data: learners,
            };
        } catch (error) {
            console.error("Error in getTopLearners:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTopRevenueCourses: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const courses = await DashboardRepository.getTopRevenueCourses({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Top revenue courses fetched successfully.",
                data: courses,
            };
        } catch (error) {
            console.error("Error in getTopRevenueCourses:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTopRevenueInstructors: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const instructors = await DashboardRepository.getTopRevenueInstructors({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Top revenue instructors fetched successfully.",
                data: instructors,
            };
        } catch (error) {
            console.error("Error in getTopRevenueInstructors:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getMonthlyUserStatistics: async (year) => {
        try {
            const stats = await DashboardRepository.getMonthlyUserStatistics(year);
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Monthly user statistics fetched successfully.",
                data: stats,
            };
        } catch (error) {
            console.error("Error in getMonthlyUserStatistics:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getMonthlyEnrollmentStatistics: async (year) => {
        try {
            const stats = await DashboardRepository.getMonthlyEnrollmentStatistics(year);
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Monthly enrollment statistics fetched successfully.",
                data: stats,
            };
        } catch (error) {
            console.error("Error in getMonthlyEnrollmentStatistics:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTotalRevenue: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const totalRevenue = await DashboardRepository.getTotalRevenue({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Total revenue fetched successfully.",
                data: totalRevenue,
            };
        } catch (error) {
            console.error("Error in getTotalRevenue:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getMonthlyRevenueStatistics: async (year) => {
        try {
            const stats = await DashboardRepository.getMonthlyRevenueStatistics(year);
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Monthly revenue statistics fetched successfully.",
                data: stats,
            };
        } catch (error) {
            console.error("Error in getMonthlyRevenueStatistics:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getPopularCourses: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const courses = await DashboardRepository.getTopPopularCourses({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Top popular courses fetched successfully.",
                data: courses,
            };
        } catch (error) {
            console.error("Error in getPopularCourses:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTopLearners: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const learners = await DashboardRepository.getTopLearners({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Top learners fetched successfully.",
                data: learners,
            };
        } catch (error) {
            console.error("Error in getTopLearners:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTopRevenueCourses: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const courses = await DashboardRepository.getTopRevenueCourses({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Top revenue courses fetched successfully.",
                data: courses,
            };
        } catch (error) {
            console.error("Error in getTopRevenueCourses:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getTopRevenueInstructors: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const instructors = await DashboardRepository.getTopRevenueInstructors({
                startDate,
                endDate,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Top revenue instructors fetched successfully.",
                data: instructors,
            };
        } catch (error) {
            console.error("Error in getTopRevenueInstructors:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getInstructorRevenueList: async (filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const { search, page, limit } = filters;
            const result = await DashboardRepository.getInstructorRevenueList({
                startDate,
                endDate,
                search,
                page,
                limit,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Instructor revenue list fetched successfully.",
                data: result,
            };
        } catch (error) {
            console.error("Error in getInstructorRevenueList:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },

    getInstructorCourseRevenue: async (instructorId, filters = {}) => {
        try {
            const { startDate, endDate } = calculateDateRange(filters);
            const { page, limit } = filters;
            const result = await DashboardRepository.getInstructorCourseRevenue({
                instructorId,
                startDate,
                endDate,
                page,
                limit,
            });
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: "Instructor course revenue fetched successfully.",
                data: result,
            };
        } catch (error) {
            console.error("Error in getInstructorCourseRevenue:", error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal server error.",
                data: null,
            };
        }
    },
};

module.exports = dashboardService;
