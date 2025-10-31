const courseManagementService = require("../../repositories/admin/courseManagement.repository");
const { response, error_response } = require("../../utils/response.util");

const adminCourseManagementController = {
    getAllCourses: async (req, res) => {
        try {
            const result = await courseManagementService.getAllCourses();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    }
};

module.exports = { adminCourseManagementController };