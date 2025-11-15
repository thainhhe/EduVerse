const axios = require("axios");
const courseManagementRepository = require("../../repositories/admin/courseManagement.repository");
const { course_enum } = require("../../config/enum/course.constants");
const { system_enum } = require("../../config/enum/system.constant");
const {
  sendCourseApprovalEmail,
  sendCourseRejectionEmail,
} = require("../../utils/mail.util");

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

      // --- 🚀 GỬI EMAIL THÔNG BÁO APPROVE 🚀 ---
      try {
        const instructor = result.course.main_instructor;
        const courseTitle = result.course.title;

        // <-- 🚀 THÊM DÒNG NÀY ĐỂ KIỂM TRA
        console.log("Chuẩn bị gửi mail. Thông tin giảng viên:", instructor);

        if (instructor && instructor.email) {
          // <-- 🚀 THÊM DÒNG NÀY ĐỂ KIỂM TRA
          console.log(`Đang gửi mail approve tới: ${instructor.email}`);

          await sendCourseApprovalEmail(
            instructor.email,
            instructor.username || "Giảng viên",
            courseTitle
          );
        } else {
          // <-- 🚀 THÊM DÒNG NÀY ĐỂ KIỂM TRA
          console.log("Không tìm thấy email giảng viên, không thể gửi mail.");
        }
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }

      // Trigger RAG sync (fire-and-forget) so search/index cập nhật
      try {
        const CHATBOT_SERVICE_URL = process.env.CHATBOT_SERVICE_URL;
        const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
        if (!CHATBOT_SERVICE_URL || !INTERNAL_API_KEY) {
          console.warn(
            "[triggerRagSync] CHATBOT_SERVICE_URL or INTERNAL_API_KEY missing; skipping trigger."
          );
        } else {
          axios
            .post(
              `${CHATBOT_SERVICE_URL.replace(/\/$/, "")}/trigger-sync`,
              null,
              {
                headers: { "x-internal-api-key": INTERNAL_API_KEY },
                timeout: 3000,
              }
            )
            .then(() => {
              console.log(
                "[triggerRagSync] Triggered chatbot-service /trigger-sync successfully."
              );
            })
            .catch((err) => {
              console.warn(
                "[triggerRagSync] Failed to call /trigger-sync:",
                err?.message || err
              );
            });
        }
      } catch (err) {
        console.warn(
          "[triggerRagSync] Unexpected error when triggering sync:",
          err?.message || err
        );
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
      // ... (error handling không đổi) ...
    }
  },

  // Reject course
  rejectCourse: async (courseId, reasonReject) => {
    try {
      if (!reasonReject || reasonReject.trim() === "") {
        // ... (validation không đổi) ...
      }

      // 🌟 QUAN TRỌNG: Đảm bảo hàm rejectCourse của repo trả về
      // course object đã được populate 'main_instructor'
      const result = await courseManagementRepository.rejectCourse(
        courseId,
        reasonReject
      );

      if (!result) {
        // ... (not found không đổi) ...
      }

      // --- 🚀 GỬI EMAIL THÔNG BÁO REJECT 🚀 ---
      try {
        const instructor = result.main_instructor; // Giả sử result là course object
        const courseTitle = result.title;

        if (instructor && instructor.email) {
          await sendCourseRejectionEmail(
            instructor.email,
            instructor.username || "Giảng viên",
            courseTitle,
            reasonReject // Gửi kèm lý do
          );
        }
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
        // Không return lỗi, chỉ log lại
      }
      // --- KẾT THÚC GỬI EMAIL ---

      return {
        status: system_enum.STATUS_CODE.OK,
        success: true,
        message: "Course rejected successfully",
        data: result,
      };
    } catch (error) {
      console.error("Error in rejectCourse:", error);
      // ... (error handling không đổi) ...
    }
  },
};

module.exports = { courseManagementService };
