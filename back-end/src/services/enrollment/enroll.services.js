const { system_enum } = require("../../config/enum/system.constant");
const { enrollment_enum } = require("../../config/enum/enroll.constants");
const enrollmentRepository = require("../../repositories/enroll.repository");
const enrollValidator = require("../../validator/enroll.validator");
const enrollmentHelper = require("./enroll.helper");
const progressRepository = require("../../repositories/progress.repository");

const enrollmentServices = {
  getAllEnrollments: async () => {
    try {
      const enrollments = await enrollmentRepository.getAllEnrollments();
      return {
        status: system_enum.STATUS_CODE.OK,
        message: system_enum.SYSTEM_MESSAGE.SUCCESS,
        data: enrollmentHelper.formatEnrollments(enrollments),
      };
    } catch (error) {
      console.error("Service Error - getAllEnrollments:", error);
      throw error;
    }
  },

  getEnrollmentById: async (id) => {
    try {
      const enrollment = await enrollmentRepository.getEnrollmentById(id);

      if (!enrollment) {
        return {
          status: system_enum.STATUS_CODE.NOT_FOUND,
          message: enrollment_enum.ENROLLMENT_MESSAGE.ENROLLMENT_NOT_FOUND,
        };
      }

      return {
        status: system_enum.STATUS_CODE.OK,
        message: system_enum.SYSTEM_MESSAGE.SUCCESS,
        data: enrollmentHelper.formatEnrollment(enrollment),
      };
    } catch (error) {
      console.error("Service Error - getEnrollmentById:", error);
      throw error;
    }
  },

  getAllEnrollmentByUser: async (userId) => {
    try {
      const enrollments = await enrollmentRepository.getAllEnrollmentByUser(
        userId
      );
      return {
        status: system_enum.STATUS_CODE.OK,
        message: system_enum.SYSTEM_MESSAGE.SUCCESS,
        data: enrollmentHelper.formatEnrollments(enrollments),
      };
    } catch (error) {
      console.error("Service Error - getAllEnrollmentByUser:", error);
      throw error;
    }
  },

  createEnrollment: async (enrollData) => {
    try {
      const validatedData = enrollValidator.validateEnrollData(
        enrollData,
        false
      );
      console.log("validatedData", validatedData);

      const existingEnrollment =
        await enrollmentRepository.getEnrollmentByUserAndCourse(
          validatedData.userId,
          validatedData.courseId
        );

      if (existingEnrollment) {
        return {
          status: system_enum.STATUS_CODE.BAD_REQUEST,
          message: enrollment_enum.ENROLLMENT_MESSAGE.DUPLICATE_ENROLLMENT,
        };
      }

      const newEnrollment = await enrollmentRepository.createEnrollment(
        validatedData
      );
      const formattedData = enrollmentHelper.formatEnrollment(newEnrollment);
      console.log("formattedData", formattedData);
      return {
        status: system_enum.STATUS_CODE.CREATED,
        message: enrollment_enum.ENROLLMENT_MESSAGE.ENROLL_SUCCESS,
        data: formattedData,
      };
    } catch (error) {
      // Handle validation errors
      if (error.isValidation) {
        return {
          status: system_enum.STATUS_CODE.BAD_REQUEST,
          message: "Validation failed",
          errors: error.validationErrors,
        };
      }

      throw error;
    }
  },

  updateEnrollment: async (id, enrollData) => {
    try {
      const validatedData = enrollValidator.validateEnrollData(
        enrollData,
        true
      );

      const existingEnrollment = await enrollmentRepository.getEnrollmentById(
        id
      );
      if (!existingEnrollment) {
        return {
          status: system_enum.STATUS_CODE.NOT_FOUND,
          message: enrollment_enum.ENROLLMENT_MESSAGE.ENROLLMENT_NOT_FOUND,
        };
      }

      const updatedEnrollment = await enrollmentRepository.updateEnrollment(
        id,
        validatedData
      );
      return {
        status: system_enum.STATUS_CODE.OK,
        message: enrollment_enum.ENROLLMENT_MESSAGE.UPDATE_SUCCESS,
        data: enrollmentHelper.formatEnrollment(updatedEnrollment),
      };
    } catch (error) {
      console.error("Service Error - updateEnrollment:", error);

      // Handle validation errors
      if (error.isValidation) {
        return {
          status: system_enum.STATUS_CODE.BAD_REQUEST,
          message: "Validation failed",
          errors: error.validationErrors,
        };
      }

      throw error;
    }
  },

  deleteEnrollment: async (id) => {
    try {
      const existingEnrollment = await enrollmentRepository.getEnrollmentById(
        id
      );
      if (!existingEnrollment) {
        return {
          status: system_enum.STATUS_CODE.NOT_FOUND,
          message: enrollment_enum.ENROLLMENT_MESSAGE.ENROLLMENT_NOT_FOUND,
        };
      }

      const deletedEnrollment = await enrollmentRepository.deleteEnrollment(id);
      return {
        status: system_enum.STATUS_CODE.OK,
        message: enrollment_enum.ENROLLMENT_MESSAGE.DELETE_SUCCESS,
        data: enrollmentHelper.formatEnrollment(deletedEnrollment),
      };
    } catch (error) {
      console.error("Service Error - deleteEnrollment:", error);
      throw error;
    }
  },

  getDetailedEnrollmentByUser: async (userId) => {
    try {
      const enrollments =
        await enrollmentRepository.getDetailedEnrollmentByUser(userId);

      if (!enrollments || enrollments.length === 0) {
        return {
          status: system_enum.STATUS_CODE.NOT_FOUND,
          message: enrollment_enum.ENROLLMENT_MESSAGE.ENROLLMENT_NOT_FOUND,
          data: [],
        };
      }

      const formatted = enrollments.map((e) =>
        enrollmentHelper.formatDetailedEnrollment(e)
      );

      return {
        status: system_enum.STATUS_CODE.OK,
        message: system_enum.SYSTEM_MESSAGE.SUCCESS,
        data: formatted,
      };
    } catch (error) {
      console.error("Service Error - getDetailedEnrollmentByUser:", {
        message: error.message,
        stack: error.stack,
        userId,
      });
      return {
        status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
        ...(process.env.NODE_ENV === "development" && {
          error: error.message,
          stack: error.stack,
        }),
      };
    }
  },
  getDetailedEnrollmentByUserIdCourseId: async (userId, courseId) => {
    try {
      const enrollment =
        await enrollmentRepository.getDetailedEnrollmentByUserIdCourseId(
          userId,
          courseId
        );

      if (!enrollment) {
        return {
          status: system_enum.STATUS_CODE.NOT_FOUND,
          message: enrollment_enum.ENROLLMENT_MESSAGE.ENROLLMENT_NOT_FOUND,
          data: null,
        };
      }

      const formatted = enrollmentHelper.formatDetailedEnrollment(enrollment);

      return {
        status: system_enum.STATUS_CODE.OK,
        message: system_enum.SYSTEM_MESSAGE.SUCCESS,
        data: formatted,
      };
    } catch (error) {
      console.error("Service Error - getDetailedEnrollmentByUser:", {
        message: error.message,
        stack: error.stack,
        userId,
      });
      return {
        status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
        ...(process.env.NODE_ENV === "development" && {
          error: error.message,
          stack: error.stack,
        }),
      };
    }
  },

  
  // Recalculate progress for a specific enrollment
  recalculateProgress: async (userId, courseId) => {
        try {
            console.log(
                `Service: Recalculating progress for user ${userId} in course ${courseId}`
            );

            // ✨ SỬA LỖI: Gọi đúng repository ✨
            const progressData = await progressRepository.calculateUserProgress(
                userId,
                courseId
            );

            if (!progressData) { // Sửa check: progressData là enrollment đã update
                throw new Error("Enrollment not found or failed to update");
            }

            console.log(`Service: Progress recalculated successfully`);

            // progressData chính là enrollment đã được cập nhật
            return {
                status: system_enum.STATUS_CODE.OK,
                message: "Progress recalculated",
                data: {
                    progress: progressData.progress,
                    status: progressData.status
                }
            };

        } catch (error) {
            console.error("Service Error - recalculateProgress:", error);
            throw error;
        }
    },

  getEnrollmentByUserAndCourse: async (userId, courseId) => {
    try {
      const enrollment =
        await enrollmentRepository.getEnrollmentByUserAndCourse(
          userId,
          courseId
        );
      if (!enrollment) {
        return {
          status: system_enum.STATUS_CODE.NOT_FOUND,
          message: enrollment_enum.ENROLLMENT_MESSAGE.ENROLLMENT_NOT_FOUND,
        };
      }

      return {
        status: system_enum.STATUS_CODE.OK,
        message: system_enum.SYSTEM_MESSAGE.SUCCESS,
        data: enrollmentHelper.formatEnrollment(enrollment),
      };
    } catch (error) {
      console.error("Service Error - getEnrollmentByUserAndCourse:", error);
      throw error;
    }
  },
};

module.exports = enrollmentServices;
