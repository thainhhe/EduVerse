const dashboardService = require("../../services/admin/dashboard.services");
const { response, error_response } = require("../../utils/response.util");

const dashboardController = {
    getTotalUsers: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getToitalUsers(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalInstructors: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalInstructors(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalLearners: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalLearners(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalCourses: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalCourses(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalApprovedCourses: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalApprovedCourses(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalPendingCourses: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalPendingCourses(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalPendingReports: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalPendingReports(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalEnrollments: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalEnrollments(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getMonthlyUserStatistics: async (req, res) => {
        try {
            const year = parseInt(req.params.year, 10);
            const result = await dashboardService.getMonthlyUserStatistics(year);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getMonthlyEnrollmentStatistics: async (req, res) => {
        try {
            const year = parseInt(req.params.year, 10);
            const result = await dashboardService.getMonthlyEnrollmentStatistics(year);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalRevenue: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalRevenue(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getMonthlyRevenueStatistics: async (req, res) => {
        try {
            const year = parseInt(req.params.year, 10);
            const result = await dashboardService.getMonthlyRevenueStatistics(year);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTopPopularCourses: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getPopularCourses(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTopLearners: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTopLearners(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTopRevenueCourses: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTopRevenueCourses(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTopRevenueInstructors: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTopRevenueInstructors(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalUsers: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getToitalUsers(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalInstructors: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalInstructors(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalLearners: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalLearners(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalCourses: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalCourses(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalApprovedCourses: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalApprovedCourses(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalPendingCourses: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalPendingCourses(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalPendingReports: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalPendingReports(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalEnrollments: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalEnrollments(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getMonthlyUserStatistics: async (req, res) => {
        try {
            const year = parseInt(req.params.year, 10);
            const result = await dashboardService.getMonthlyUserStatistics(year);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getMonthlyEnrollmentStatistics: async (req, res) => {
        try {
            const year = parseInt(req.params.year, 10);
            const result = await dashboardService.getMonthlyEnrollmentStatistics(year);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalRevenue: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTotalRevenue(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getMonthlyRevenueStatistics: async (req, res) => {
        try {
            const year = parseInt(req.params.year, 10);
            const result = await dashboardService.getMonthlyRevenueStatistics(year);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTopPopularCourses: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getPopularCourses(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTopLearners: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTopLearners(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTopRevenueCourses: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTopRevenueCourses(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTopRevenueInstructors: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getTopRevenueInstructors(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getInstructorRevenueList: async (req, res) => {
        try {
            const filters = req.query;
            const result = await dashboardService.getInstructorRevenueList(filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getInstructorCourseRevenue: async (req, res) => {
        try {
            const { instructorId } = req.params;
            const filters = req.query;
            const result = await dashboardService.getInstructorCourseRevenue(instructorId, filters);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { dashboardController };
