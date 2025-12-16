const { courseManagementService } = require("../../services/admin/courseManagement.services");
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

    // Approve course
    approveCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            const result = await courseManagementService.approveCourse(courseId);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    // Reject course
    rejectCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            const { reasonReject } = req.body;

            const result = await courseManagementService.rejectCourse(courseId, reasonReject);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    updateFlagCourse: async (req, res) => {
        try {
            const id = req.params.id;
            const flag = req.body.flag;
            const result = await courseManagementService.updateFlagCourse(id, flag);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { adminCourseManagementController };
