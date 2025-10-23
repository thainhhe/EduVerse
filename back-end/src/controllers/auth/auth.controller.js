const { authService } = require("../../services/auth/auth.service");
const { response, error_response } = require("../../utils/response.util");

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    register: async (req, res) => {
        try {
            const data = req.body;
            const result = await authService.register(data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { authController };
