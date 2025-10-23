const Report = require('../models/report.model');

// Create a new report
const createReport = async (req, res) => {
    try {
        const { userId, issueType, description, fileAttachment } = req.body;

        // Validate
        if (!userId || !issueType || !description) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }
        
        const newReport = await Report.create({
            userId,
            issueType,
            description,
            fileAttachment
        });
        res.status(201).json({ report: newReport });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all reports
const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find().populate('userId', 'name email');
        res.status(200).json({ reports });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all reports by a specific user
const getUserReports = async (req, res) => {
    try {
        const { userId } = req.params;
        const reports = await Report.find({ userId }).populate('userId', 'name email');
        res.status(200).json({ reports });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Update report status (admin)
const updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;

        // Validate
        if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status value' 
            });
        }

        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            { status },
            { new: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.status(200).json({ report: updatedReport });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteReport = async (req, res) => {
    try {
        const { reportId } = req.params;

        const deletedReport = await Report.findByIdAndDelete(reportId);

        if (!deletedReport) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createReport,
    getAllReports,
    getUserReports,
    updateReportStatus,
    deleteReport
};
