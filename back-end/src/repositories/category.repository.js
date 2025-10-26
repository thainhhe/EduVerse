const Category = require("../models/Category");

const categoryRepository = {
    getAll: async () => {
        return await Category.find().exec();
    },

    getById: async (id) => {
        return await Category.findById(id).exec();
    },

    getByName: async (name) => {
        return await Category.findOne({ name }).exec();
    },

    create: async (data) => {
        const category = new Category(data);
        return await category.save();
    },

    update: async (id, data) => {
        return await Category.findByIdAndUpdate(id, data, { new: true }).exec();
    },

    delete: async (id) => {
        return await Category.findByIdAndDelete(id).exec();
    },

    save: async (data) => {
        return data.save();
    },
};

module.exports = categoryRepository;