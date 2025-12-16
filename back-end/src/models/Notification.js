const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: false, default: null },
        title: { type: String },
        type: {
            type: String,
            enum: ["info", "warning", "alert", "success", "error"],
            required: true,
            default: "info",
        },
        message: { type: String, required: true },
        link: { type: String, required: false, default: null },
        isRead: { type: Boolean, default: false },
        isGlobal: { type: Boolean, default: false },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    {
        timestamps: true,
        collection: "notifications",
    }
);

module.exports = mongoose.model("Notification", notificationSchema);
