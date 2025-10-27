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
    try {
      // Sử dụng đúng trường main_instructor và isDeleted
      const courses = await Course.find({
        main_instructor: instructorId,
        isDeleted: false,
      })
        .populate("category", "name") // Chỉ populate những trường cần thiết
        // Bỏ populate modules/lessons ở đây
        .select("-__v -isDeleted") // Loại bỏ các trường không cần thiết
        .sort({ createdAt: -1 }) // Sắp xếp nếu muốn
        .lean() // Dùng lean() để trả về plain JS objects
        .exec();
      return courses; // Trả về danh sách khóa học tìm được
    } catch (err) {
      console.error("Lỗi trong repository findByInstructor:", err);
      throw err; // Ném lỗi để service/controller xử lý
    }
  },
};

module.exports = { courseRepository };
