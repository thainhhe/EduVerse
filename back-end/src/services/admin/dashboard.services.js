const DashboardRepository = require('../../repositories/admin/dashboard.repository');
const { system_enum } = require('../../config/enum/system.constant');
const { get } = require('mongoose');

const dashboardService = {
    getToitalUsers: async () => {
        try {
            const totalUsers = await DashboardRepository.getTotalUsers();
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: 'Total users fetched successfully.',
                data: totalUsers,
            };
        } catch (error) {
            console.error('Error in getTotalUsers:', error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: 'Internal server error.',
                data: null,
            };
        }
    },

    getTotalInstructors: async () => {
        try {
            const totalInstructors = await DashboardRepository.getTotalInstructors();
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: 'Total instructors fetched successfully.',
                data: totalInstructors,
            };
        } catch (error) {
            console.error('Error in getTotalInstructors:', error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: 'Internal server error.',
                data: null,
            };
        }
    },
    
    getTotalLearners: async () => {
        try {
            const totalLearners = await DashboardRepository.getTotalLearners();
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: 'Total learners fetched successfully.',
                data: totalLearners,
            };
        } catch (error) {
            console.error('Error in getTotalLearners:', error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: 'Internal server error.',
                data: null,
            };
        }
    },

    getTotalCourses: async () => {
        try {
            const totalCourses = await DashboardRepository.getTotalCourses();
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: 'Total courses fetched successfully.',
                data: totalCourses,
            };
        } catch (error) {
            console.error('Error in getTotalCourses:', error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: 'Internal server error.',
                data: null,
            };
        }
    },

    getTotalApprovedCourses: async () => {
        try {
            const totalApprovedCourses = await DashboardRepository.getTotalApprovedCourses();
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: 'Total approved courses fetched successfully.',
                data: totalApprovedCourses,
            };
        } catch (error) {
            console.error('Error in getTotalApprovedCourses:', error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: 'Internal server error.',
                data: null,
            };
        }
    },

    getTotalPendingCourses: async () => {
        try {
            const totalPendingCourses = await DashboardRepository.getTotalPendingCourses();
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: 'Total pending courses fetched successfully.',
                data: totalPendingCourses,
            };
        } catch (error) {
            console.error('Error in getTotalPendingCourses:', error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: 'Internal server error.',
                data: null,
            };
        }
    },

    getTotalPendingReports: async () => {
        try {
            const totalPendingReports = await DashboardRepository.getTotalPendingReports();
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: 'Total pending reports fetched successfully.',
                data: totalPendingReports,
            };
        } catch (error) {
            console.error('Error in getTotalPendingReports:', error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: 'Internal server error.',
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
                message: 'Monthly user statistics fetched successfully.',
                data: stats,
            };
        } catch (error) {
            console.error('Error in getMonthlyUserStatistics:', error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: 'Internal server error.',
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
                message: 'Monthly revenue statistics fetched successfully.',
                data: stats,
            };
        } catch (error) {
            console.error('Error in getMonthlyRevenueStatistics:', error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: 'Internal server error.',
                data: null,
            };
        }
    },

    getPopularCourses: async () => {
        try {
            const courses = await DashboardRepository.getTopPopularCourses();
            return {
                status: system_enum.STATUS_CODE.OK,
                success: true,
                message: 'Top popular courses fetched successfully.',
                data: courses,
            };
        } catch (error) {
            console.error('Error in getPopularCourses:', error);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: 'Internal server error.',
                data: null,
            };
        }
    },

};

module.exports = dashboardService;