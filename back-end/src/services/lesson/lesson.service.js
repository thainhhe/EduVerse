const { lesson_enum } = require("../../config/enum/lesson.constants");
const { system_enum } = require("../../config/enum/system.constant");
const lessonRepository = require("../../repositories/lesson.repository");
const { lessonHelper } = require("./lesson.helper");

const lessonService = {
    getAllLesson: async () => {
        try {
            const result = await lessonRepository.findAll();
            if (!result || result.length === 0) result = [];
            return {
                status: system_enum.STATUS_CODE.OK,
                message: lesson_enum.LESSON_MESSAGE.GET_DATA_SUCCESS,
                data: result.map((r) => lessonHelper.formatLessonData(r)),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    getLessonById: async (id) => {
        try {
            if (!id) return { status: system_enum.STATUS_CODE.CONFLICT, message: "" };
            const result = await lessonRepository.findById(id);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: lesson_enum.LESSON_MESSAGE.GET_DATA_SUCCESS,
                data: lessonHelper.formatLessonData(result),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    getLessonByModuleId: async (id) => {
        try {
            if (!id)
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: lesson_enum.LESSON_MESSAGE.INVALID_OBJECT_ID,
                };
            const result = await lessonRepository.findByModuleId(id);
            if (!result || result.length === 0)
                return {
                    status: system_enum.STATUS_CODE.OK,
                    message: lesson_enum.LESSON_MESSAGE.GET_DATA_SUCCESS,
                    data: [],
                };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: lesson_enum.LESSON_MESSAGE.GET_DATA_SUCCESS,
                data: result.map((r) => lessonHelper.formatLessonData(r)),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    createLesson: async (data) => {
        try {
            const lesson = await lessonRepository.createLesson(data);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: lesson_enum.LESSON_MESSAGE.GET_DATA_SUCCESS,
                data: lessonHelper.formatLessonData(lesson),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    updateLesson: async (id, data) => {
        try {
            if (!id)
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: lesson_enum.LESSON_MESSAGE.INVALID_OBJECT_ID,
                };
            const lesson = await lessonRepository.updateLesson(id, data);
            if (!lesson)
                return { status: system_enum.STATUS_CODE.NOT_FOUND, message: lesson_enum.LESSON_MESSAGE.NOT_FOUND };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: lesson_enum.LESSON_MESSAGE.UPDATE_SUCCESS,
                data: lessonHelper.formatLessonData(lesson),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    deleteLesson: async (id) => {
        try {
            if (!id)
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: lesson_enum.LESSON_MESSAGE.INVALID_OBJECT_ID,
                };
            const lesson = await lessonRepository.deleteLesson(id);
            if (!lesson)
                return { status: system_enum.STATUS_CODE.NOT_FOUND, message: lesson_enum.LESSON_MESSAGE.NOT_FOUND };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: lesson_enum.LESSON_MESSAGE.DELETE_SUCCESS,
                data: lessonHelper.formatLessonData(lesson),
            };
        } catch (error) {
            throw new Error(error);
        }
    },
};

module.exports = { lessonService };
