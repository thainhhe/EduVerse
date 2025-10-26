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
};

module.exports = { lessonController };
