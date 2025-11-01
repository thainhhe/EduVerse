const { logService } = require("../../services/log/log.service");
const { response, error_response } = require("../../utils/response.util");

const logController = {
    read_log: async (req, res) => {
        try {
            const { limit } = req.params;
            const logs = logService.readLogs(limit ? Number(limit) : null);
            return response(res, logs);
        } catch (error) {
            return error_response(res, error);
        }
    },
    clear_log: async (req, res) => {
        try {
            const result = logService.clearLogs();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { logController };
