const { course_enum } = require("../../config/enum/course.constants");
const { system_enum } = require("../../config/enum/system.constant");
const { courseRepository } = require("../../repositories/course.repository");
const { upLoadImage } = require("../../utils/response.util");
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
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: error,
                data: [],
            };
        }
    },

    getAllCourseForLearner: async () => {
        try {
            const result = await courseRepository.getAllForLearner();
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
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: error,
                data: [],
            };
        }
    },

    getAllCourseInstructor: async (id) => {
        try {
            const result = await courseRepository.getAllByMainInstructor(id);
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
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                success: false,
                message: error,
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

    createCourse: async (data, file) => {
        try {
            if (file !== null) {
                const thumbnail_ = await upLoadImage(file);
                data.thumbnail = thumbnail_;
            }
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

    updateCourse: async (id, data, file) => {
        try {
            if (!id)
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: course_enum.COURSE_MESSAGE.INVALID_OBJECT_ID,
                };
            if (file !== null) {
                const thumbnail_ = await upLoadImage(file);
                data.thumbnail = thumbnail_;
            }
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
};

module.exports = { courseService };
