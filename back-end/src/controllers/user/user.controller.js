const { userService } = require("../../services/user/user.service");
const { response, error_response } = require("../../utils/response.util");

const userController = {
    getProfile: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await userService.getProfile(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    updateProfile: async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const result = await userService.updateProfile(id, data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    closeAccount: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await userService.closeAccount(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { userController };
