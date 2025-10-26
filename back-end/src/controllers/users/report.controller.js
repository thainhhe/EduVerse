const reportServices = require("../../services/report/report.services");

const getAllReports = async (req, res) => {
    try {
        const result = await reportServices.getAllReports();
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await reportServices.getReportById(id);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const createReport = async (req, res) => {
    try {
        const reportData = req.body;
        const result = await reportServices.createReport(reportData);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const reportData = req.body;
        const result = await reportServices.updateReport(id, reportData);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await reportServices.deleteReport(id);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getAllReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
};