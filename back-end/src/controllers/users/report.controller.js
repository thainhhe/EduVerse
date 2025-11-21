const reportService = require('../../services/report/report.services');

const reportController = {
    // === Student ===
    createReport: async (req, res) => {
        try {
            const data = await reportService.createReport(req.body);
            res.status(201).json({ success: true, data: data });
        } catch (error) {
            console.error('Controller Error - createReport:', error.message);
            if (error.message.includes('not found')) {
                return res.status(404).json({ success: false, message: error.message });
            }
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    getMyReports: async (req, res) => {
        try {
            const { userId } = req.params;
            const data = await reportService.getMyReports(userId);
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            console.error('Controller Error - getMyReports:', error.message);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // === Instructor ===
    getAssignedReports: async (req, res) => {
        try {
            const { instructorId } = req.params; 
            const data = await reportService.getAssignedReports(instructorId);
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            console.error('Controller Error - getAssignedReports:', error.message);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    updateReportStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const data = await reportService.updateReportStatus(id, status);
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            console.error('Controller Error - updateReportStatus:', error.message);
            if (error.message.includes('not found')) {
                return res.status(404).json({ success: false, message: error.message });
            }
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // === Admin ===
    getAllReports: async (req, res) => {
        try {
            const data = await reportService.getAllReports();
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            console.error('Controller Error - getAllReports:', error.message);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
    
    adminUpdateReport: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ success: false, message: '"status" is required in body' });
            }
            const data = await reportService.adminUpdateReportStatus(id, status);
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            console.error('Controller Error - adminUpdateReport:', error.message);
            if (error.message.includes('not found')) {
                return res.status(404).json({ success: false, message: error.message });
            }
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
    
    adminDeleteReport: async (req, res) => {
        try {
            const { id } = req.params;
            await reportService.adminDeleteReport(id);
            res.status(200).json({ success: true, data: { message: 'Report deleted successfully' } });
        } catch (error) {
            console.error('Controller Error - adminDeleteReport:', error.message);
            if (error.message.includes('not found')) {
                return res.status(404).json({ success: false, message: error.message });
            }
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
};

module.exports = reportController;