const Module = require("../models/Module");

const moduleRepository = {
    findAll: async () => {
        return await Module.find().populate("courseId", "title").exec();
    },

    findById: async (id) => {
        return await Module.findById(id).populate("courseId", "title").exec();
    },

    findByCourseId: async (courseId) => {
        return await Module.find({ courseId }).exec();
    },

    createModule: async (data) => {
        return await Module.create(data);
    },

    updateModule: async (id, update) => {
        return await Module.findByIdAndUpdate(id, update, { new: true }).exec();
    },

    deleteModule: async (id) => {
        return await Module.findByIdAndDelete(id).exec();
    },

    save: async (module) => {
        return await module.save();
    },
};

module.exports = moduleRepository;
