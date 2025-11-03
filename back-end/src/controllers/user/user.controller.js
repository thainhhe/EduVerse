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
            const file = req.file || null;
            const result = await userService.updateProfile(id, data, file);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    getInstructor: async (req, res) => {
        try {
            const result = await userService.getInstructorProfile();
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

    request_reset_password: async (req, res) => {
        try {
            const { email } = req.body;
            const result = await userService.requestResetPassword(email);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    verify_otp_client: async (req, res) => {
        try {
            const { email, otp } = req.body;
            const result = await userService.verify_otp(email, otp);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { userController };
