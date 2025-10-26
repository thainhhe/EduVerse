const reportHelper = {
    cleanedReportData: (reportData) => {
        if (!reportData) return {};

        const cleanedData = {
            reportedItemId: reportData.reportedItemId,
            reportedItemType: reportData.reportedItemType,
            reason: reportData.reason,
            description: reportData.description,
        };
        return cleanedData;
    },

    formatReportResponse: (report) => {
        return {
            id: report.id,
            reportedItemId: report.reportedItemId,
            reportedItemType: report.reportedItemType,
            reason: report.reason,
            description: report.description,
            status: report.status,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
        };
    },
};

module.exports = reportHelper;