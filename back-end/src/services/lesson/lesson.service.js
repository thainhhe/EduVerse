const { lesson_enum } = require("../../config/enum/lesson.constants");
const { system_enum } = require("../../config/enum/system.constant");
const lessonRepository = require("../../repositories/lesson.repository");
const { lessonHelper } = require("./lesson.helper");
const Module = require("../../models/Module");
const enrollmentRepository = require("../../repositories/enroll.repository");

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
                data: lessonHelper.sortLessonsByOrder(result.map((r) => lessonHelper.formatLessonData(r))),
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

    // Mark lesson as completed and recalculate progress
    markLessonCompleted: async (lessonId, userId) => {
        try {
            console.log(`🎯 Service: Marking lesson ${lessonId} as completed for user ${userId}`);

            // 1. Mark lesson as completed
            const result = await lessonRepository.markLessonCompleted(lessonId, userId);

            // 2. Get courseId from lesson -> module
            const lesson = await lessonRepository.findById(lessonId);
            if (!lesson) {
                throw new Error('Lesson not found');
            }

            const module = await Module.findById(lesson.moduleId);
            if (!module) {
                throw new Error('Module not found');
            }

            const courseId = module.courseId;

            // 3. Recalculate progress
            const progressData = await enrollmentRepository.calculateUserProgress(userId, courseId);

            console.log(`Service: Lesson completed and progress updated`);

            return {
                ...result,
                progress: progressData
            };
        } catch (error) {
            console.error('Service Error - markLessonCompleted:', error);
            throw error;
        }
    },

    // Unmark lesson and recalculate progress
    unmarkLessonCompleted: async (lessonId, userId) => {
        try {
            console.log(`Service: Unmarking lesson ${lessonId} for user ${userId}`);

            // 1. Unmark lesson
            const result = await lessonRepository.unmarkLessonCompleted(lessonId, userId);

            // 2. Get courseId from lesson -> module
            const lesson = await lessonRepository.findById(lessonId);
            if (!lesson) {
                throw new Error('Lesson not found');
            }

            const module = await Module.findById(lesson.moduleId);
            if (!module) {
                throw new Error('Module not found');
            }

            const courseId = module.courseId;

            // 3. Recalculate progress
            const progressData = await enrollmentRepository.calculateUserProgress(userId, courseId);

            console.log(`Service: Lesson unmarked and progress updated`);

            return {
                ...result,
                progress: progressData
            };
        } catch (error) {
            console.error('Service Error - unmarkLessonCompleted:', error);
            throw error;
        }
    },

    // Check if lesson is completed by user
    checkLessonCompletion: async (lessonId, userId) => {
        try {
            const isCompleted = await lessonRepository.isLessonCompletedByUser(lessonId, userId);
            return {
                lessonId,
                userId,
                completed: isCompleted
            };
        } catch (error) {
            console.error('Service Error - checkLessonCompletion:', error);
            throw error;
        }
    }
};

module.exports = { lessonService };
