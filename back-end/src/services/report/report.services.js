const systemEnum = require("../../config/enum/system.constant");
const reportEnum = require("../../config/enum/report.constants");
const reportRepository = require("../../repositories/report.repository");
const reportValidator = require("../../validator/report.validator");
const reportHelper = require("./report.helper");

const reportServices = {
    getAllReports: async () => {
        try {
            const reports = await reportRepository.getAll();
            return {
                status: systemEnum.STATUS_CODE.OK,
                message: systemEnum.SYSTEM_MESSAGE.SUCCESS,
                data: reportHelper.formatReports(reports),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    getReportById: async (id) => {
        try {
            const report = await reportRepository.getById(id);

            if (!report) {
                return {
                    status: systemEnum.STATUS_CODE.NOT_FOUND,
                    message: reportEnum.REPORT_MESSAGE.REPORT_NOT_FOUND,
                };
            }

            return {
                status: systemEnum.STATUS_CODE.OK,
                message: systemEnum.SYSTEM_MESSAGE.SUCCESS,
                data: reportHelper.formatReport(report),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    createReport: async (reportData) => {
        try {
            const validatedData = reportValidator.validateReportData(reportData, false);

            const newReport = await reportRepository.create(validatedData);

            return {
                status: systemEnum.STATUS_CODE.CREATED,
                message: reportEnum.REPORT_MESSAGE.CREATE_SUCCESS,
                data: reportHelper.formatReport(newReport),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    updateReport: async (id, reportData) => {
        try {
            const validatedData = reportValidator.validateReportData(reportData, true);

            const updatedReport = await reportRepository.update(id, validatedData);

            if (!updatedReport) {
                return {
                    status: systemEnum.STATUS_CODE.NOT_FOUND,
                    message: reportEnum.REPORT_MESSAGE.REPORT_NOT_FOUND,
                };
            }

            return {
                status: systemEnum.STATUS_CODE.OK,
                message: reportEnum.REPORT_MESSAGE.UPDATE_SUCCESS,
                data: reportHelper.formatReport(updatedReport),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    deleteReport: async (id) => {
        try {
            const deletedReport = await reportRepository.delete(id);

            if (!deletedReport) {
                return {
                    status: systemEnum.STATUS_CODE.NOT_FOUND,
                    message: reportEnum.REPORT_MESSAGE.REPORT_NOT_FOUND,
                };
            }

            return {
                status: systemEnum.STATUS_CODE.OK,
                message: reportEnum.REPORT_MESSAGE.DELETE_SUCCESS,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
};

module.exports = reportServices;