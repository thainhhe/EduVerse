const { STATUS_CODE, SYSTEM_MESSAGE, SUCCESS_MESSAGE } = require("../../config/enum");
const courseRepository = require("../../repositories/course.repository");

const courseService = {
    getAllCourse: async () => {
        try {
            const result = await courseRepository.getAll();
            return { status: STATUS_CODE.OK, message: SYSTEM_MESSAGE.SUCCESS, data: result };
        } catch (error) {
            throw new Error(error);
        }
    },

    getCourseById: async (id) => {
        try {
            const course = await courseRepository.getById(id);
            if (!course) return { status: STATUS_CODE.NOT_FOUND, message: SYSTEM_MESSAGE.NOT_FOUND };
            return { status: STATUS_CODE.OK, message: SYSTEM_MESSAGE.SUCCESS, data: course };
        } catch (error) {
            throw new Error(error);
        }
    },

    createCourse: async (data) => {
        try {
            const result = await courseRepository.create(data);
            return { status: STATUS_CODE.CREATED, message: SUCCESS_MESSAGE.COURSE_CREATED, data: result };
        } catch (error) {
            throw new Error(error);
        }
    },

    updateCourse: async (id, data) => {
        try {
            const result = await courseRepository.update(id, data);
            return { status: STATUS_CODE.OK, message: SYSTEM_MESSAGE.SUCCESS, data: result };
        } catch (error) {
            throw new Error(error);
        }
    },
    deleteCourse: async (id) => {
        try {
            const result = await courseRepository.delete(id);
            return { status: STATUS_CODE.OK, message: SYSTEM_MESSAGE.SUCCESS, data: result };
        } catch (error) {
            throw new Error(error);
        }
    },
};

module.exports = courseService;
