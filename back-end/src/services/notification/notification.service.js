const { system_enum } = require("../../config/enum/system.constant");
const { notificationRepository } = require("../../repositories/motification.repository");

const notificationService = {
    getAll: async () => {
        try {
            const result = await notificationRepository.getAll();
            if (!result || result.length === 0)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.NOT_FOUND,
                };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    getGlobal: async () => {
        try {
            const result = await notificationRepository.getGlobal();
            if (!result || result.length === 0)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.NOT_FOUND,
                };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    getByReceiverId: async (id) => {
        try {
            const result = await notificationRepository.getByReceiverId(id);
            if (!result || result.length === 0)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.NOT_FOUND,
                };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    getBySenderId: async (id) => {
        try {
            const result = await notificationRepository.getBySenderId(id);
            if (!result || result.length === 0)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.NOT_FOUND,
                };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    create: async (data) => {
        try {
            const result = await notificationRepository.create(data);
            if (!result)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.NOT_FOUND,
                };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    update: async (id, data) => {
        try {
            const result = await notificationRepository.update(id, data);
            if (!result)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.NOT_FOUND,
                };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    delete: async (id) => {
        try {
            const result = await notificationRepository.delete(id);
            if (!result)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.NOT_FOUND,
                };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
};

module.exports = { notificationService };
