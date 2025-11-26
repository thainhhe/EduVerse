const Notification = require("../models/Notification");

const notificationRepository = {
    getAll: async () => {
        return await Notification.find()
            .populate("senderId", "name email avatar")
            .populate("receiverId", "name email avatar")
            .sort({ createdAt: -1 })
            .exec();
    },

    getGlobal: async () => {
        return await Notification.find({ isGlobal: true })
            .populate("senderId", "name email avatar")
            .sort({ createdAt: -1 })
            .exec();
    },

    getByReceiverId: async (id) => {
        // Get personal notifications AND global notifications
        // Note: Global notifications won't have a receiverId usually, or we treat them separately.
        // For now, let's just get personal ones.
        return await Notification.find({
            $or: [{ receiverId: id }, { isGlobal: true }],
        })
            .populate("senderId", "name email avatar")
            .sort({ createdAt: -1 })
            .exec();
    },

    getBySenderId: async (id) => {
        return await Notification.find({ senderId: id })
            .populate("receiverId", "name email avatar")
            .sort({ createdAt: -1 })
            .exec();
    },

    create: async (data) => {
        return await Notification.create(data);
    },

    createMany: async (dataArray) => {
        return await Notification.insertMany(dataArray);
    },

    update: async (id, data) => {
        return await Notification.findByIdAndUpdate(id, data, { new: true });
    },

    delete: async (id) => {
        return await Notification.findByIdAndDelete(id);
    },

    markAsRead: async (id) => {
        return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    },

    markAllAsRead: async (userId) => {
        return await Notification.updateMany({ receiverId: userId, isRead: false }, { isRead: true });
    },

    countUnread: async (userId) => {
        return await Notification.countDocuments({ receiverId: userId, isRead: false });
    },
};

module.exports = { notificationRepository };
