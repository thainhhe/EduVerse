const {
  STATUS_CODE,
  SYSTEM_MESSAGE,
  INPUT_ERROR,
  FORUM_ERROR_MESSAGE,
} = require("../../config/enum/index");
const Forum = require("../../models/Forum");
const Course = require("../../models/Course");

const forumService = {
  async createForum(data) {
    try {
      const { title, description, courseId } = data;

      //   const course = await Course.findById(courseId);
      //   if (!course) {
      //     return {
      //       status: STATUS_CODE.NOT_FOUND,
      //       message: "Không tìm thấy khóa học để tạo forum",
      //     };
      //   }

      const existingForum = await Forum.findOne({ courseId });
      if (existingForum) {
        return {
          status: STATUS_CODE.CONFLICT,
          message: "Khóa học này đã có forum, không thể tạo thêm",
        };
      }

      const newForum = await Forum.create({ title, description, courseId });

      return {
        status: STATUS_CODE.OK,
        message: SYSTEM_MESSAGE.SUCCESS,
        data: newForum,
      };
    } catch (error) {
      throw new Error(error);
    }
  },

  async getAllForums() {
    try {
      const forums = await Forum.find()
        .populate("courseId", "name code description")
        .sort({ createdAt: -1 });

      return {
        status: STATUS_CODE.OK,
        message: SYSTEM_MESSAGE.SUCCESS,
        data: forums,
      };
    } catch (error) {
      throw new Error(error);
    }
  },

  async getForumById(id) {
    try {
      const forum = await Forum.findById(id).populate(
        "courseId",
        "name code description"
      );

      if (!forum) {
        return {
          status: STATUS_CODE.NOT_FOUND,
          message:
            FORUM_ERROR_MESSAGE.FORUM_NOT_FOUND || "Không tìm thấy forum",
        };
      }

      return {
        status: STATUS_CODE.OK,
        message: SYSTEM_MESSAGE.SUCCESS,
        data: forum,
      };
    } catch (error) {
      throw new Error(error);
    }
  },

  async updateForum(id, data) {
    try {
      const { title, description } = data;

      const forum = await Forum.findById(id);
      if (!forum) {
        return {
          status: STATUS_CODE.NOT_FOUND,
          message:
            FORUM_ERROR_MESSAGE.FORUM_NOT_FOUND ||
            "Không tìm thấy forum để cập nhật",
        };
      }

      forum.title = title || forum.title;
      forum.description = description || forum.description;
      forum.updatedAt = Date.now();

      await forum.save();

      return {
        status: STATUS_CODE.OK,
        message: SYSTEM_MESSAGE.SUCCESS,
        data: forum,
      };
    } catch (error) {
      throw new Error(error);
    }
  },

  async deleteForum(id) {
    try {
      const forum = await Forum.findById(id);
      if (!forum) {
        return {
          status: STATUS_CODE.NOT_FOUND,
          message:
            FORUM_ERROR_MESSAGE.FORUM_NOT_FOUND ||
            "Không tìm thấy forum để xóa",
        };
      }

      await Forum.findByIdAndDelete(id);
      return {
        status: STATUS_CODE.OK,
        message: "Xóa forum thành công",
        data: forum,
      };
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = { forumService };
