const { lesson_enum } = require("../../config/enum/lesson.constants");
const { system_enum } = require("../../config/enum/system.constant");
const lessonRepository = require("../../repositories/lesson.repository");
const { lessonHelper } = require("./lesson.helper");
const Module = require("../../models/Module");
const progressRepository = require("../../repositories/progress.repository");
const Quiz = require("../../models/Quiz");
const scoreRepository = require("../../repositories/score.repository");

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
            console.log(`🎯 Service: Attempting to mark lesson ${lessonId} for user ${userId}`);

            // --- BƯỚC 1: LOGIC CHẶN (QUAN TRỌNG) ---

            // 1.1. Tìm xem lesson này có quiz nào không
            const associatedQuiz = await Quiz.findOne({
                lessonId: lessonId,
                isPublished: true
            }).select('_id').lean();

            if (associatedQuiz) {
                console.log(`Lesson ${lessonId} has an associated quiz: ${associatedQuiz._id}`);

                // 1.2. Nếu có quiz, kiểm tra xem user đã "pass" quiz này chưa
                const attempts = await scoreRepository.getUserAttempts(userId, associatedQuiz._id);
                const hasPassed = attempts.some(attempt => attempt.status === 'passed');

                if (!hasPassed) {
                    console.warn(`User ${userId} tried to complete lesson ${lessonId} but has not passed the quiz.`);
                    // TRẢ VỀ LỖI - KHÔNG CHO HOÀN THÀNH
                    return {
                        status: system_enum.STATUS_CODE.BAD_REQUEST, // 400
                        message: "Bạn phải vượt qua bài quiz trong bài học này trước khi đánh dấu hoàn thành.",
                        data: null
                    };
                }
                console.log(`User ${userId} has passed the quiz. Proceeding...`);
            }

            // --- BƯỚC 2: TIẾN HÀNH ĐÁNH DẤU HOÀN THÀNH ---
            // (Chỉ chạy khi không có quiz, hoặc đã pass quiz)

            const result = await lessonRepository.markLessonCompleted(lessonId, userId);

            // --- BƯỚC 3: TRIGGER TÍNH TOÁN LẠI TIẾN ĐỘ ---

            // Chỉ tính toán lại nếu đây là LẦN ĐẦU TIÊN hoàn thành
            if (result.isNewCompletion) {
                console.log(`New completion detected. Recalculating progress...`);

                // Tìm courseId (như code cũ của bạn)
                const lesson = await lessonRepository.findById(lessonId); // Dùng repo cho nhất quán
                if (!lesson || !lesson.moduleId) {
                    throw new Error('Lesson or Module not found while recalculating progress');
                }

                // Bạn có thể cache `moduleId` ở `lesson` để không phải query lại
                const module = await Module.findById(lesson.moduleId).select('courseId').lean();
                if (!module) {
                    throw new Error('Module not found while recalculating progress');
                }

                const courseId = module.courseId;

                // Gọi hàm tính toán
                const progressData = await progressRepository.calculateUserProgress(userId, courseId);

                return {
                    status: system_enum.STATUS_CODE.OK,
                    message: result.message,
                    data: {
                        progress: progressData.progress,
                        status: progressData.status
                    }
                };
            }

            // Nếu không phải lần hoàn thành mới
            return {
                status: system_enum.STATUS_CODE.OK,
                message: result.message, // "Lesson already completed"
                data: null
            };

        } catch (error) {
            console.error('Service Error - markLessonCompleted:', error);
            // Ném lỗi để controller có thể bắt
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
            const progressData = await progressRepository.calculateUserProgress(userId, courseId);

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
