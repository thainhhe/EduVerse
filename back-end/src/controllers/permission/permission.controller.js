const { permissionService } = require("../../services/permission/permission.service");

const permissionController = {
    getAll: async (req, res) => {
        try {
            const result = await permissionService.getAll();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { permissionController };
