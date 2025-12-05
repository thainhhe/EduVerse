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

    getByReceiverId: async (id, { search, page = 1, limit = 10 }) => {
        const skip = (page - 1) * limit;
        const query = {
            $or: [{ receiverId: id }, { isGlobal: true }],
        };

        if (search) {
            query.$and = [
                {
                    $or: [
                        { title: { $regex: search, $options: "i" } },
                        { message: { $regex: search, $options: "i" } },
                    ],
                },
            ];
        }

        const [notifications, total] = await Promise.all([
            Notification.find(query)
                .populate("senderId", "name email avatar")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            Notification.countDocuments(query),
        ]);

        return { notifications, total, page, limit, totalPages: Math.ceil(total / limit) };
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

    markAsRead: async (id, userId) => {
        return await Notification.findByIdAndUpdate(id, { $addToSet: { readBy: userId } }, { new: true });
    },

    markAllAsRead: async (userId) => {
        // Mark all personal notifications as read
        // AND mark all global notifications as read by this user
        return await Notification.updateMany(
            {
                $or: [{ receiverId: userId }, { isGlobal: true }],
            },
            { $addToSet: { readBy: userId } }
        );
    },

    countUnread: async (userId) => {
        return await Notification.countDocuments({
            $or: [{ receiverId: userId }, { isGlobal: true }],
            readBy: { $ne: userId },
        });
    },
};

module.exports = { notificationRepository };
