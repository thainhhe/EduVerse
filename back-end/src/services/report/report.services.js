const reportRepository = require('../../repositories/report.repository');
const Course = require('../../models/Course');

const reportService = {
    createReport: async (reportData) => {
        try {
            let assigneeId = null;
            const userId = reportData.userId;

            if (reportData.scope === 'system') {
                assigneeId = null;
            }
            else if (reportData.scope === 'course') {
                const course = await Course.findById(reportData.courseId).select('main_instructor');
                if (!course) throw new Error('Course not found');
                if (!course.main_instructor) throw new Error('Course has no main instructor assigned');
                assigneeId = course.main_instructor;
            }

            const fullReportData = { ...reportData, userId, assigneeId };
            return await reportRepository.create(fullReportData);
        } catch (error) {
            console.error('Service Error - createReport:', error);
            throw error;
        }
    },

    getMyReports: async (userId) => {
        try {
            return await reportRepository.findByUserId(userId);
        } catch (error) {
            console.error('Service Error - getMyReports:', error);
            throw error;
        }
    },

    getAssignedReports: async (assigneeId) => {
        try {
            return await reportRepository.findByAssigneeId(assigneeId);
        } catch (error) {
            console.error('Service Error - getAssignedReports:', error);
            throw error;
        }
    },

    getAllReports: async () => {
        try {
            return await reportRepository.findAll();
        } catch (error) {
            console.error('Service Error - getAllReports:', error);
            throw error;
        }
    },

    // Dành cho Instructor (không cần biết ai gọi)
    updateReportStatus: async (reportId, newStatus) => {
        try {
            const report = await reportRepository.findById(reportId);
            if (!report) {
                throw new Error('Report not found');
            }

            return await reportRepository.updateById(reportId, { status: newStatus });
        } catch (error) {
            console.error('Service Error - updateReportStatus:', error);
            throw error;
        }
    },

    // Dành cho Admin (chỉ cập nhật status)
    adminUpdateReportStatus: async (reportId, newStatus) => {
        try {
            return await reportRepository.updateById(reportId, { status: newStatus });
        } catch (error) {
            console.error('Service Error - adminUpdateReportStatus:', error);
            throw error;
        }
    },

    adminDeleteReport: async (reportId) => {
        try {
            return await reportRepository.deleteById(reportId);
        } catch (error) {
            console.error('Service Error - adminDeleteReport:', error);
            throw error;
        }
    }
};

module.exports = reportService;