const { module_enum } = require("../../config/enum/module.constants");
const { system_enum } = require("../../config/enum/system.constant");
const moduleRepository = require("../../repositories/module.repository");
const { lessonService } = require("../lesson/lesson.service");
const { moduleHelper } = require("./module.helper");

const moduleService = {
    getModuleByCourseId: async (id) => {
        try {
            const result = await moduleRepository.findByCourseId(id);
            if (!result || result.length === 0) {
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: module_enum.MODULE_MESSAGE.NOT_FOUND,
                    data: [],
                };
            }
            const modulesWithLessons = await Promise.all(
                result.map(async (module) => {
                    const lessons = await lessonService.getLessonByModuleId(module._id);
                    return {
                        ...(module.toObject?.() || module),
                        lessons: lessons.data,
                    };
                })
            );

            return {
                status: system_enum.STATUS_CODE.OK,
                message: module_enum.MODULE_MESSAGE.GET_DATA_SUCCESS,
                data: modulesWithLessons,
            };
        } catch (error) {
            throw new Error(error.message || error);
        }
    },
    getModuleId: async (id) => {
        try {
            const result = await moduleRepository.findById(id);
            if (!result)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: module_enum.MODULE_MESSAGE.NOT_FOUND,
                };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: module_enum.MODULE_MESSAGE.GET_DATA_SUCCESS,
                data: result.map((m) => moduleHelper.formatModuleData(m)),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    createModule: async (data) => {
        try {
            const module = await moduleRepository.createModule(data);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: module_enum.MODULE_MESSAGE.CREATE_SUCCESS,
                data: moduleHelper.formatModuleData(module),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    updateModule: async (id, data) => {
        try {
            if (!id) return { status: system_enum.STATUS_CODE.CONFLICT, message: "" };
            const module = await moduleRepository.updateModule(id, data);
            if (!module) return { status: system_enum.STATUS_CODE.NOT_FOUND, message: "" };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: module_enum.MODULE_MESSAGE.UPDATE_SUCCESS,
                data: moduleHelper.formatModuleData(module),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    deleteModule: async (id) => {
        try {
            if (!id)
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: module_enum.MODULE_MESSAGE.INVALID_OBJECT_ID,
                };
            const module = await moduleRepository.deleteModule(id);
            if (!module)
                return { status: system_enum.STATUS_CODE.NOT_FOUND, message: module_enum.MODULE_MESSAGE.NOT_FOUND };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: module_enum.MODULE_MESSAGE.DELETE_SUCCESS,
                data: moduleHelper.formatModuleData(module),
            };
        } catch (error) {
            throw new Error(error);
        }
    },
};

module.exports = { moduleService };
