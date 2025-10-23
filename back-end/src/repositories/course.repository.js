const Course = require("../models/Course");

const courseRepository = {
  getAll: async () => {
    return await Course.find()
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

  findByInstructor: async (instructorId) => {
    // trả về các course do instructor tạo (chỉ active)
    return await Course.find({ instructor: instructorId, status: "active" })
      .select("-__v")
      .populate({
        path: "modules",
        populate: { path: "lessons", model: "Lesson" },
      })
      .exec();
  },
};

module.exports = { courseRepository };
