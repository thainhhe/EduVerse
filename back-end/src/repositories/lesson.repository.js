const Lesson = require("../models/Lesson");

const lessonRepository = {
    findAll: async () => {
        return await Lesson.find().populate("moduleId", "title").exec();
    },

    findById: async (id) => {
        return await Lesson.findById(id).populate("moduleId", "title").exec();
    },

    findByModuleId: async (moduleId) => {
        return await Lesson.find({ moduleId }).exec();
    },

    createLesson: async (data) => {
        return await Lesson.create(data);
    },

    updateLesson: async (id, update) => {
        return await Lesson.findByIdAndUpdate(id, update, { new: true }).exec();
    },

    deleteLesson: async (id) => {
        return await Lesson.findByIdAndDelete(id).exec();
    },

    save: async (lesson) => {
        return await lesson.save();
    },

    // Mark lesson as completed by user
    markLessonCompleted: async (lessonId, userId) => {
        try {
            // Kiểm tra xem user đã complete lesson này chưa
            const lesson = await Lesson.findById(lessonId);

            if (!lesson) {
                throw new Error('Lesson not found');
            }

            // Nếu userId chưa có trong user_completed thì thêm vào
            if (!lesson.user_completed.includes(userId)) {
                lesson.user_completed.push(userId);
                await lesson.save();
                console.log(`User ${userId} completed lesson ${lessonId}`);
                return { success: true, message: 'Lesson marked as completed' };
            }

            return { success: true, message: 'Lesson already completed' };
        } catch (error) {
            console.error('Repository Error - markLessonCompleted:', error);
            throw error;
        }
    },

    // Unmark lesson (nếu cần rollback)
    unmarkLessonCompleted: async (lessonId, userId) => {
        try {
            const lesson = await Lesson.findById(lessonId);

            if (!lesson) {
                throw new Error('Lesson not found');
            }

            // Xóa userId khỏi user_completed
            lesson.user_completed = lesson.user_completed.filter(
                id => id.toString() !== userId.toString()
            );
            await lesson.save();

            console.log(`❌ User ${userId} unmarked lesson ${lessonId}`);
            return { success: true, message: 'Lesson unmarked' };
        } catch (error) {
            console.error('Repository Error - unmarkLessonCompleted:', error);
            throw error;
        }
    },

    // Check if user completed a lesson
    isLessonCompletedByUser: async (lessonId, userId) => {
        try {
            const lesson = await Lesson.findById(lessonId).select('user_completed');

            if (!lesson) {
                return false;
            }

            return lesson.user_completed.some(
                id => id.toString() === userId.toString()
            );
        } catch (error) {
            console.error('Repository Error - isLessonCompletedByUser:', error);
            throw error;
        }
    },
};

module.exports = lessonRepository;
