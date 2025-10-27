const { course_enum } = require("../../config/enum/course.constants");
const { system_enum } = require("../../config/enum/system.constant");
const { courseRepository } = require("../../repositories/course.repository");
const mongoose = require("mongoose");
const { moduleService } = require("../module/module.service");

const courseService = {
  getAllCourse: async () => {
    try {
      const result = await courseRepository.getAll();
      if (!result || result.length === 0) {
        return {
          status: system_enum.STATUS_CODE.NOT_FOUND,
          success: false,
          message: course_enum.COURSE_MESSAGE.NOT_FOUND,
          data: [],
        };
      }
      const data = await Promise.all(
        result.map(async (c) => {
          const modulesResult = await moduleService.getModuleByCourseId(c._id);
          const modules = modulesResult?.data || [];
          return {
            ...(c.toObject ? c.toObject() : c),
            modules,
          };
        })
      );

      return {
        status: system_enum.STATUS_CODE.OK,
        success: true,
        message: course_enum.COURSE_MESSAGE.GET_DATA_SUCCESS,
        data,
      };
    } catch (error) {
      console.error("Error in getAllCourse:", error);
      return {
        status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Internal server error.",
        data: [],
      };
    }
  },

  getCourseById: async (id) => {
    try {
      if (!id) {
        return {
          status: system_enum.STATUS_CODE.CONFLICT,
          success: false,
          message: course_enum.COURSE_MESSAGE.INVALID_OBJECT_ID,
        };
      }
      const course = await courseRepository.getById(id);
      if (!course) {
        return {
          status: system_enum.STATUS_CODE.NOT_FOUND,
          success: false,
          message: course_enum.COURSE_MESSAGE.NOT_FOUND,
        };
      }
      const modulesResult = await moduleService.getModuleByCourseId(course._id);
      const modules = modulesResult?.data || [];
      return {
        status: system_enum.STATUS_CODE.OK,
        success: true,
        message: course_enum.COURSE_MESSAGE.GET_DATA_SUCCESS,
        data: {
          ...(course.toObject ? course.toObject() : course),
          modules,
        },
      };
    } catch (error) {
      throw new Error(error);
    }
  },

  createCourse: async (data) => {
    try {
      const result = await courseRepository.create(data);
      return {
        status: system_enum.STATUS_CODE.CREATED,
        message: course_enum.COURSE_MESSAGE.CREATE_SUCCESS,
        data: result,
      };
    } catch (error) {
      throw new Error(error);
    }
  },

  updateCourse: async (id, data) => {
    try {
      if (!id)
        return {
          status: system_enum.STATUS_CODE.CONFLICT,
          message: course_enum.COURSE_MESSAGE.INVALID_OBJECT_ID,
        };
      const result = await courseRepository.update(id, data);
      return {
        status: system_enum.STATUS_CODE.OK,
        message: course_enum.COURSE_MESSAGE.UPDATE_SUCCESS,
        data: result,
      };
    } catch (error) {
      throw new Error(error);
    }
  },
  deleteCourse: async (id) => {
    try {
      if (!id)
        return {
          status: system_enum.STATUS_CODE.CONFLICT,
          message: course_enum.COURSE_MESSAGE.INVALID_OBJECT_ID,
        };
      const result = await courseRepository.delete(id);
      return {
        status: system_enum.STATUS_CODE.OK,
        message: course_enum.COURSE_MESSAGE.DELETE_SUCCESS,
        data: result,
      };
    } catch (error) {
      throw new Error(error);
    }
  },

  async getCoursesByInstructorId(instructorId) {
    try {
      // Kiểm tra instructorId
      if (!instructorId || !mongoose.Types.ObjectId.isValid(instructorId)) {
        console.error(
          `Service nhận instructorId không hợp lệ: ${instructorId}`
        );
        return {
          status: system_enum.STATUS_CODE.BAD_REQUEST, // Dùng enum đã import
          success: false,
          message: "ID giảng viên không hợp lệ.",
          data: [],
        };
      }

      // Gọi hàm repository đã sửa
      const courses = await courseRepository.findByInstructor(instructorId);

      // Xử lý nếu không có khóa học nào
      if (!courses || courses.length === 0) {
        return {
          status: system_enum.STATUS_CODE.OK, // Vẫn là OK, chỉ là không có dữ liệu
          success: true,
          message: "Không tìm thấy khóa học nào cho giảng viên này.",
          data: [],
        };
      }

      // Modules không còn được populate ở đây nữa.
      // Nếu cần, bạn có thể lặp qua courses và gọi moduleService.getModuleByCourseId(course._id)
      // nhưng sẽ không hiệu quả. Tốt nhất để frontend tự gọi khi cần.

      return {
        status: system_enum.STATUS_CODE.OK, // Dùng enum đã import
        success: true,
        message: "Lấy danh sách khóa học của giảng viên thành công.",
        data: courses, // Trả về dữ liệu (đã là plain object do .lean())
      };
    } catch (error) {
      console.error(
        `Lỗi service getCoursesByInstructorId cho giảng viên ${instructorId}:`,
        error
      );
      // Ném lỗi để controller bắt và dùng error_response
      throw error;
    }
  },
};

module.exports = { courseService };
