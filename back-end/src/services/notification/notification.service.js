const { system_enum } = require("../../config/enum/system.constant");
const { notificationRepository } = require("../../repositories/notification.repository");

const notificationService = {
    getAll: async () => {
        try {
            const result = await notificationRepository.getAll();
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
            const unreadCount = await notificationRepository.countUnread(id);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: {
                    notifications: result,
                    unreadCount: unreadCount,
                },
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    getBySenderId: async (id) => {
        try {
            const result = await notificationRepository.getBySenderId(id);
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
            let result;
            // Handle multiple receivers
            if (Array.isArray(data.receiverId)) {
                const notifications = data.receiverId.map((id) => ({
                    ...data,
                    receiverId: id,
                }));
                result = await notificationRepository.createMany(notifications);
            } else {
                result = await notificationRepository.create(data);
            }

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
    markAsRead: async (id) => {
        try {
            const result = await notificationRepository.markAsRead(id);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    markAllAsRead: async (userId) => {
        try {
            const result = await notificationRepository.markAllAsRead(userId);
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
