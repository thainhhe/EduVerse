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
      const filters = req.query;
      const result = await dashboardService.getPopularCourses(filters);
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },
};

module.exports = { dashboardController };
