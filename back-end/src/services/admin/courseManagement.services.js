const courseManagementRepository = require("../../repositories/admin/courseManagement.repository");
const { course_enum } = require("../../config/enum/course.constants");
const { system_enum } = require("../../config/enum/system.constant");

const courseManagementService = {
  getAllCourses: async () => {
    try {
      const result = await courseManagementRepository.getAllCourses();
      if (!result || result.length === 0) {
        return {
          status: system_enum.STATUS_CODE.NOT_FOUND,
          success: false,
          message: course_enum.COURSE_MESSAGE.NOT_FOUND,
          data: [],
        };
      }
      return {
        status: system_enum.STATUS_CODE.OK,
        success: true,
        message: course_enum.COURSE_MESSAGE.GET_DATA_SUCCESS,
        data: result,
      };
    } catch (error) {
      console.error("Error in getAllCourses:", error);
      return {
        status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Internal server error.",
        data: [],
      };
    }
  },

  // Get course details by ID
  getCourseDetailsById: async (courseId) => {
    try {
      const result = await courseManagementRepository.getCourseDetailsById(
        courseId
      );
      if (!result) {
        return {
          status: system_enum.STATUS_CODE.NOT_FOUND,
          success: false,
          message: course_enum.COURSE_MESSAGE.NOT_FOUND,
          data: null,
        };
      }
      return {
        status: system_enum.STATUS_CODE.OK,
        success: true,
        message: course_enum.COURSE_MESSAGE.GET_DATA_SUCCESS,
        data: result,
      };
    } catch (error) {
      console.error("Error in getCourseDetailsById:", error);
      return {
        status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Internal server error.",
        data: null,
      };
    }
  },

  // Approve course
  approveCourse: async (courseId) => {
    try {
      const result = await courseManagementRepository.approveCourse(courseId);

      if (!result || !result.course) {
        return {
          status: system_enum.STATUS_CODE.NOT_FOUND,
          success: false,
          message: course_enum.COURSE_MESSAGE.NOT_FOUND,
          data: null,
        };
      }

      return {
        status: system_enum.STATUS_CODE.OK,
        success: true,
        message: "Course approved and published successfully",
        data: {
          course: result.course,
          quizzesPublished: result.quizzesPublished,
        },
      };
    } catch (error) {
      console.error("Error in approveCourse:", error);
      return {
        status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || "Internal server error.",
        data: null,
      };
    }
  },

  // Reject course
  rejectCourse: async (courseId, reasonReject) => {
    try {
      if (!reasonReject || reasonReject.trim() === "") {
        return {
          status: system_enum.STATUS_CODE.BAD_REQUEST,
          success: false,
          message: "Rejection reason is required",
          data: null,
        };
      }

      const result = await courseManagementRepository.rejectCourse(
        courseId,
        reasonReject
      );

      if (!result) {
        return {
          status: system_enum.STATUS_CODE.NOT_FOUND,
          success: false,
          message: course_enum.COURSE_MESSAGE.NOT_FOUND,
          data: null,
        };
      }

      return {
        status: system_enum.STATUS_CODE.OK,
        success: true,
        message: "Course rejected successfully",
        data: result,
      };
    } catch (error) {
      console.error("Error in rejectCourse:", error);
      return {
        status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || "Internal server error.",
        data: null,
      };
    }
  },
};

module.exports = { courseManagementService };
