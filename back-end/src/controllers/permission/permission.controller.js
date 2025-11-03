const { permissionService } = require("../../services/permission/permission.service");
const { error_response, response } = require("../../utils/response.util");

const permissionController = {
    getAll: async (req, res) => {
        try {
            const result = await permissionService.getAll();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    assign_permission: async (req, res) => {
        try {
            const data = req.body;
            const result = await permissionService.assignPermission(data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    request_invite: async (req, res) => {
        try {
            const data = req.body;
            const result = await permissionService.request_invite(data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { permissionController };
