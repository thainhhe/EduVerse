const {system_enum} = require("../../config/enum/system.constant");
const {enrollment_enum} = require("../../config/enum/enroll.constants");
const enrollmentRepository = require("../../repositories/enroll.repository");
const enrollValidator = require("../../validator/enroll.validator");
const enrollmentHelper = require("./enroll.helper");

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
            console.error('Service Error - getAllEnrollments:', error);
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
            console.error('Service Error - getEnrollmentById:', error);
            throw error;
        }
    },

    createEnrollment: async (enrollData) => {
        try {
            const validatedData = enrollValidator.validateEnrollData(enrollData, false);

            const existingEnrollment = await enrollmentRepository.getEnrollmentByUserAndCourse(
                validatedData.userId,
                validatedData.courseId
            );
            
            if (existingEnrollment) {
                return {
                    status: system_enum.STATUS_CODE.BAD_REQUEST,
                    message: enrollment_enum.ENROLLMENT_MESSAGE.DUPLICATE_ENROLLMENT,
                };
            }

            const newEnrollment = await enrollmentRepository.createEnrollment(validatedData);
            const formattedData = enrollmentHelper.formatEnrollment(newEnrollment);

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
                    message: 'Validation failed',
                    errors: error.validationErrors,
                };
            }
            
            throw error;
        }
    },

    updateEnrollment: async (id, enrollData) => {
        try {
            const validatedData = enrollValidator.validateEnrollData(enrollData, true);

            const existingEnrollment = await enrollmentRepository.getEnrollmentById(id);
            if (!existingEnrollment) {
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: enrollment_enum.ENROLLMENT_MESSAGE.ENROLLMENT_NOT_FOUND,
                };
            }

            const updatedEnrollment = await enrollmentRepository.updateEnrollment(id, validatedData);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: enrollment_enum.ENROLLMENT_MESSAGE.UPDATE_SUCCESS,
                data: enrollmentHelper.formatEnrollment(updatedEnrollment),
            };
        } catch (error) {
            console.error('Service Error - updateEnrollment:', error);
            
            // Handle validation errors
            if (error.isValidation) {
                return {
                    status: system_enum.STATUS_CODE.BAD_REQUEST,
                    message: 'Validation failed',
                    errors: error.validationErrors,
                };
            }
            
            throw error;
        }
    },

    deleteEnrollment: async (id) => {
        try {
            const existingEnrollment = await enrollmentRepository.getEnrollmentById(id);
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
            console.error('Service Error - deleteEnrollment:', error);
            throw error;
        }
    },
};

module.exports = enrollmentServices;