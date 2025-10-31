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

    createCourse: async (req, res) => {
        try {
            const data = req.body;
            const file = req.file || null;
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

    async getMyCourses(req, res) {
        try {
            // Kiểm tra req.userId (được thêm bởi middleware verifyToken)
            if (!req.userId) {
                console.error("Thiếu req.userId trong controller getMyCourses.");
                // Trả về lỗi 401 Unauthorized
                return res.status(401).json({
                    success: false,
                    message: "Không được phép: Thiếu ID người dùng.",
                });
                // Hoặc dùng error_response nếu muốn chuẩn hóa
                // return error_response(res, { status: 401, message: "Không được phép: Thiếu ID người dùng." });
            }

            const result = await courseService.getCoursesByInstructorId(req.userId);
            return response(res, result); // Dùng hàm response chuẩn
        } catch (error) {
            // Log lỗi cụ thể tại controller này
            console.error(`Lỗi controller getMyCourses cho user ${req.userId}:`, error);
            // Gọi hàm error_response chuẩn
            return error_response(res, error);
        }
    },

    getCoursePublished: async (req, res) => {
        try {
            const result = await courseService.getCoursePublished();
            return response(res, result);
        } catch (error) {
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
