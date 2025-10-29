const Course = require("../models/Course");

const courseRepository = {
    getAll: async () => {
        return await Course.find()
            .sort({ createdAt: -1 })
            .populate("category")
            .populate("main_instructor")
            .populate("instructors.id")
            .populate("instructors.permission")
            .exec();
    },

    getAllForLearner: async () => {
        return await Course.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .populate("category")
            .populate("main_instructor")
            .populate("instructors.id")
            .populate("instructors.permission")
            .exec();
    },

    getAllByMainInstructor: async (id) => {
        return await Course.find({ main_instructor: id })
            .sort({ createdAt: -1 })
            .populate("category")
            .populate("main_instructor")
            .populate("instructors.id")
            .populate("instructors.permission")
            .exec();
    },

    getById: async (id) => {
        return await Course.findById(id)
            .populate("category")
            .populate("main_instructor")
            .populate("instructors.id")
            .populate("instructors.permission")
            .exec();
    },

    create: async (data) => {
        const course = new Course(data);
        return await course.save();
    },

    update: async (id, data) => {
        return await Course.findByIdAndUpdate(id, data, { new: true }).exec();
    },

    delete: async (id) => {
        return await Course.findByIdAndDelete(id).exec();
    },

    save: async (data) => {
        return data.save();
    },
};

module.exports = courseRepository;
