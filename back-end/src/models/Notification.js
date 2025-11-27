const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        title: { type: String },
        type: {
            type: String,
            enum: ["info", "warning", "alert", "success", "error"],
            required: true,
            default: "info",
        },
        message: { type: String, required: true },
        link: { type: String },
        isRead: { type: Boolean, default: false },
        isGlobal: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        collection: "notifications",
    }
);

module.exports = mongoose.model("Notification", notificationSchema);
