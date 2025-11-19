const IssueReport = require('../models/IssueReport');

const reportRepository = {
    create: async (reportData) => {
        const report = new IssueReport(reportData);
        return await report.save();
    },

    findById: async (id) => {
        return await IssueReport.findById(id)
            .populate('userId', 'username email')
            .populate('assigneeId', 'username email')
            .populate('courseId', 'title');
    },

    findByUserId: async (userId) => {
        return await IssueReport.find({ userId: userId })
            .populate('assigneeId', 'username email')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });
    },

    findByAssigneeId: async (assigneeId) => {
        return await IssueReport.find({ assigneeId: assigneeId })
            .populate('userId', 'username email')
            .populate('courseId', 'title')
            .sort({ status: 1, createdAt: -1 });
    },

    findAll: async () => {
        return await IssueReport.find({})
            .populate('userId', 'username email')
            .populate('assigneeId', 'username email')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });
    },

    updateById: async (id, updateData) => {
        return await IssueReport.findByIdAndUpdate(id, updateData, { new: true });
    },

    deleteById: async (id) => {
        return await IssueReport.findByIdAndDelete(id);
    },
};

module.exports = reportRepository;