const { userRepository } = require("../../repositories/user.repository");
const { response, error_response } = require("../../utils/response.util");

const userController = {
    async getProfile(req, res) {
        try {
            const id = req.params.id;
            const result = await userController.getProfile(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    async changePassword(req, res) {
        try {
            const id = req.params.id;
            const newPassword = req.body.newPassword;
            const result = await userController.changePassword(id, newPassword);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { userController };
