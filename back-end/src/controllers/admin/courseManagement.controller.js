const {courseManagementService} = require("../../services/admin/courseManagement.services");
const { response, error_response } = require("../../utils/response.util");

const adminCourseManagementController = {
    getAllCourses: async (req, res) => {
        try {
            const result = await courseManagementService.getAllCourses();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getCourseDetailsById: async (req, res) => {
        try {
            const courseId = req.params.id;
            const result = await courseManagementService.getCourseDetailsById(courseId);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { adminCourseManagementController };