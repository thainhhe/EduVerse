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
    getByReceiverId: async (id, queryParams) => {
        try {
            const { notifications, total, page, limit, totalPages } =
                await notificationRepository.getByReceiverId(id, queryParams);
            const unreadCount = await notificationRepository.countUnread(id);

            // Transform result to include isRead boolean for frontend compatibility
            const transformedNotifications = notifications.map((notif) => {
                const isRead = notif.readBy
                    ? notif.readBy.some((uid) => uid.toString() === id.toString())
                    : false;
                return { ...notif, isRead };
            });

            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: {
                    notifications: transformedNotifications,
                    unreadCount: unreadCount,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages,
                    },
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
            const io = require("../../utils/socket.util").getIO();

            // Handle multiple receivers
            if (Array.isArray(data.receiverId)) {
                const notifications = data.receiverId.map((id) => ({
                    ...data,
                    receiverId: id,
                }));
                result = await notificationRepository.createMany(notifications);

                // Emit to each receiver
                data.receiverId.forEach((id) => {
                    io.to(id.toString()).emit("new-notification", { ...data, receiverId: id });
                });
            } else {
                result = await notificationRepository.create(data);

                if (data.isGlobal) {
                    io.to("global").emit("new-notification", result);
                } else if (data.receiverId) {
                    io.to(data.receiverId.toString()).emit("new-notification", result);
                }
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
            const io = require("../../utils/socket.util").getIO();
            const result = await notificationRepository.delete(id);
            if (!result)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.NOT_FOUND,
                };

            // Emit delete event
            if (result.isGlobal) {
                io.to("global").emit("delete-notification", id);
            } else if (result.receiverId) {
                io.to(result.receiverId.toString()).emit("delete-notification", id);
            }

            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    markAsRead: async (id, userId) => {
        try {
            const result = await notificationRepository.markAsRead(id, userId);
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
