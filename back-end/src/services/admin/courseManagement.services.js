const courseManagementRepository = require("../../repositories/course.repository");
const { course_enum } = require("../../../");
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
            throw new Error(error);
        }
    }
};

module.exports = { courseManagementService };