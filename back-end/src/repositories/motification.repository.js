const Notification = require("../models/Notification");
const { getById } = require("./category.repository");

const notificationRepository = {
    getAll: async () => {
        return await Notification.find().populate("senderId", "name email").populate("receiverId", "name email").exec();
    },

    getGlobal: async () => {
        return await Notification.find({ isGlobal: true })
            .populate("senderId", "name email")
            .populate("receiverId", "name email")
            .exec();
    },

    getByReceiverId: async (id) => {
        return await Notification.find({ receiverId: id })
            .populate("receiverId", "name email")
            .populate("senderId", "name email")
            .exec();
    },

    getBySenderId: async (id) => {
        return await Notification.find({ senderId: id })
            .populate("receiverId", "name email")
            .populate("senderId", "name email")
            .exec();
    },

    create: async (data) => {
        return await Notification.create(data);
    },

    update: async (id, data) => {
        return await Notification.findByIdAndUpdate(id, data, { new: true });
    },

    delete: async (id) => {
        return await Notification.findByIdAndDelete(id);
    },
};

module.exports = { notificationRepository };
