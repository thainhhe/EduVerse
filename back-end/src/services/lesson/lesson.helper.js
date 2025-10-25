const mongoose = require("mongoose");
const lesson_enum = require("../../config/enum/lesson.constants");

const lessonHelper = {
    formatLessonData: (lesson) => {
        if (!lesson) return null;
        const { _id, moduleId, title, content, type, duration, order, status, resources, createdAt, updatedAt } =
            lesson;
        return {
            id: _id,
            moduleId,
            title,
            content,
            type,
            duration,
            order,
            status,
            resources,
            createdAt,
            updatedAt,
        };
    },
    calculateTotalDuration: (lessons = []) => {
        if (!Array.isArray(lessons)) return 0;
        return lessons.reduce((total, l) => total + (l.duration || 0), 0);
    },
    sortLessonsByOrder: (lessons = []) => {
        return [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
    },
    isLessonCompletedByUser: (lesson, userId) => {
        if (!lesson || !Array.isArray(lesson.user_completed)) return false;
        return lesson.user_completed.some((id) => id.toString() === userId.toString());
    },
    markLessonCompleted: (lesson, userId) => {
        if (!lesson || !userId) return lesson;
        if (!lesson.user_completed) lesson.user_completed = [];
        if (!lesson.user_completed.some((id) => id.toString() === userId.toString())) {
            lesson.user_completed.push(new mongoose.Types.ObjectId(userId));
        }
        return lesson;
    },
    getNextLesson: (lessons = [], currentOrder) => {
        const sorted = lessonHelper.sortLessonsByOrder(lessons);
        const index = sorted.findIndex((l) => l.order === currentOrder);
        if (index >= 0 && index < sorted.length - 1) {
            return sorted[index + 1];
        }
        return null;
    },
    validateLessonFields: (type, status) => {
        const isValidType = lesson_enum.VALIDATE_SCHEMA.TYPE.includes(type);
        const isValidStatus = lesson_enum.VALIDATE_SCHEMA.STATUS.includes(status);
        return {
            valid: isValidType && isValidStatus,
            errors: {
                type: isValidType ? null : lesson_enum.LESSON_MESSAGE.INVALID_TYPE,
                status: isValidStatus ? null : lesson_enum.LESSON_MESSAGE.INVALID_STATUS,
            },
        };
    },
};

module.exports = { lessonHelper };
