const Lesson = require("../models/lessonModel");

const lessonRepository = {
    findAll: async () => {
        return await Lesson.find().populate("moduleId", "title").exec();
    },

    findById: async (id) => {
        return await Lesson.findById(id).populate("moduleId", "title").exec();
    },

    findByCourseId: async (courseId) => {
        return await Lesson.find({ courseId }).exec();
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
};

module.exports = lessonRepository;
