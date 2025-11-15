const { lessonService } = require("../../services/lesson/lesson.service");
const { response, error_response } = require("../../utils/response.util");

const lessonController = {
    getLessonInModule: async (req, res) => {
        try {
            const id = req.params.moduleId;
            const result = await lessonService.getLessonByModuleId(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    createLesson: async (req, res) => {
        try {
            const data = req.body;
            const result = await lessonService.createLesson(data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    updateLesson: async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const result = await lessonService.updateLesson(id, data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    deleteLesson: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await lessonService.deleteLesson(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    // Mark lesson as completed
    markLessonCompleted: async (req, res) => {
        try {
            const { lessonId } = req.params;
            const { userId } = req.body;

            if (!userId) {
                return error_response(res, { status: 400, message: 'userId is required' });
            }

            const result = await lessonService.markLessonCompleted(lessonId, userId);
            return response(res, {
                status: 200,
                success: true,
                message: 'Lesson marked as completed successfully',
                data: result
            });
        } catch (error) {
            console.error('Controller Error - markLessonCompleted:', error);
            if (error.message === 'Lesson not found' || error.message === 'Module not found') {
                return error_response(res, { status: 404, message: error.message });
            }
            return error_response(res, { status: 500, message: 'Failed to mark lesson as completed' });
        }
    },

    // Unmark lesson completion
    unmarkLessonCompleted: async (req, res) => {
        try {
            const { lessonId } = req.params;
            const { userId } = req.body;

            if (!userId) {
                return error_response(res, { status: 400, message: 'userId is required' });
            }

            const result = await lessonService.unmarkLessonCompleted(lessonId, userId);
            return response(res, {
                status: 200,
                success: true,
                message: 'Lesson completion unmarked successfully',
                data: result
            });
        } catch (error) {
            console.error('Controller Error - unmarkLessonCompleted:', error);
            if (error.message === 'Lesson not found' || error.message === 'Module not found') {
                return error_response(res, { status: 404, message: error.message });
            }
            return error_response(res, { status: 500, message: 'Failed to unmark lesson completion' });
        }
    },

    // Check lesson completion status
    checkLessonCompletion: async (req, res) => {
        try {
            const { lessonId, userId } = req.params;

            const result = await lessonService.checkLessonCompletion(lessonId, userId);
            return response(res, {
                status: 200,
                success: true,
                message: 'Lesson completion status retrieved successfully',
                data: result
            });
        } catch (error) {
            console.error('Controller Error - checkLessonCompletion:', error);
            return error_response(res, { status: 500, message: 'Failed to check lesson completion' });
        }
    }
};

module.exports = { lessonController };
