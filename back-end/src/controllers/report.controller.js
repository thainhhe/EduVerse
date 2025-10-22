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
