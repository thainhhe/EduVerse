const { moduleService } = require("../../services/module/module.service");
const { error_response, response } = require("../../utils/response.util");

const moduleController = {
    getAllModuleInCourse: async (req, res) => {
        try {
            const id = req.params.courseId;
            const result = await moduleService.getModuleByCourseId(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    getModuleById: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await moduleService.getModuleId(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    createNewModule: async (req, res) => {
        try {
            const data = req.body;
            const result = await moduleService.createModule(data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    updateModule: async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const result = await moduleService.updateModule(id, data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    deleteModule: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await moduleService.deleteModule(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { moduleController };
