const { get } = require("mongoose");
const { courseService } = require("../../services/course/course.service");
const { response, error_response } = require("../../utils/response.util");

const courseController = {
    getAllCourse: async (req, res) => {
        try {
            const result = await courseService.getAllCourse();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getAllCourseForLearner: async (req, res) => {
        try {
            const result = await courseService.getAllCourseForLearner();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getAllCourseInstructor: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await courseService.getAllCourseInstructor(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getCourseById: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await courseService.getCourseById(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getCollaborativeCourse: async (req, res) => {
        try {
            const userId = req.params.userId || req.userId;
            const result = await courseService.getCollaborativeCourse(userId);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getAllUserEnrollCourse: async (req, res) => {
        try {
            const courseId = req.params.courseId;
            const result = await courseService.getAllUserInCourse(courseId);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    createCourse: async (req, res) => {
        try {
            const data = req.body;
            const file = req.file || null;
            console.log("Data in controller createCourse:", data, { file });
            const result = await courseService.createCourse(data, file);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    updateCourse: async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const file = req.file || null;
            const result = await courseService.updateCourse(id, data, file);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    deleteCourse: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await courseService.deleteCourse(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getMyCourses: async (req, res) => {
        try {
            // ensure req.userId provided by auth middleware
            if (!req.userId) {
                console.error("Missing req.userId in controller getMyCourses.");
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized: Missing user ID.",
                });
            }

            const result = await courseService.getCoursesByInstructorId(req.userId);
            return response(res, result);
        } catch (error) {
            console.error(`Error in controller getMyCourses for user ${req.userId}:`, error);
            return error_response(res, error);
        }
    },

    getCourseByCategory: async (req, res) => {
        try {
            const categoryId = req.params.categoryId;
            const result = await courseService.getCourseByCategory(categoryId);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { courseController };
