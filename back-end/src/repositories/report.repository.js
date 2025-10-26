const Report = require("../models/IssueReport");

const reportRepository = {
    getAllReports: async () => {
        return await Report.find().exec();
    },

    getReportById: async (id) => {
        return await Report.findById(id).exec();
    },

    createReport: async (data) => {
        const report = new Report(data);
        return await report.save();
    },

    updateReport: async (id, data) => {
        return await Report.findByIdAndUpdate(id, data, { new: true }).exec();
    },
    
    deleteReport: async (id) => {
        return await Report.findByIdAndDelete(id).exec();
    },

    save: async (data) => {
        return data.save();
    },
};

module.exports = reportRepository;