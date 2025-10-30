const { system_enum } = require("../../config/enum/system.constant");
const { permissionRepository } = require("../../repositories/permission.repository");

const permissionService = {
    getAll: async () => {
        try {
            const result = await permissionRepository.findAll();
            if (!result || result.length === 0)
                return { status: system_enum.STATUS_CODE.NOT_FOUND, message: "Not Found" };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: "",
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
};

module.exports = { permissionService };
