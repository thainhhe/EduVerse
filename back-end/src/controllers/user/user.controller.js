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
            const file = req.file;
            console.log(file);
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
};

module.exports = { userController };
