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
            const userId = req.userId;
            data.userId = userId;
            const result = await permissionService.assignPermission(data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    accept_invite: async (req, res) => {
        try {
            const userId = req.params.userId;
            const courseId = req.params.courseId;
            const result = await permissionService.acceptInvite({ userId, courseId });
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { permissionController };
