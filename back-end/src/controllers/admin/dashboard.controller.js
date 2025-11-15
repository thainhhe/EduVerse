const dashboardService = require('../../services/admin/dashboard.services');
const { response, error_response } = require('../../utils/response.util');

const dashboardController = {
    getTotalUsers: async (req, res) => {
        try {
            const result = await dashboardService.getToitalUsers();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalInstructors: async (req, res) => {
        try {
            const result = await dashboardService.getTotalInstructors();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalLearners: async (req, res) => {
        try {
            const result = await dashboardService.getTotalLearners();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalCourses: async (req, res) => {
        try {
            const result = await dashboardService.getTotalCourses();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    
    getTotalApprovedCourses: async (req, res) => {
        try {
            const result = await dashboardService.getTotalApprovedCourses();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    
    getTotalPendingCourses: async (req, res) => {
        try {
            const result = await dashboardService.getTotalPendingCourses();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getTotalPendingReports: async (req, res) => {
        try {
            const result = await dashboardService.getTotalPendingReports();
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
            const result = await dashboardService.getPopularCourses();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { dashboardController };