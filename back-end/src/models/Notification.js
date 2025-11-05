const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        receiverId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: { type: String, enum: ["info", "warning", "alert"], required: true, default: "info" },
        message: { type: String, required: true },
        isGlobal: { type: Boolean, default: false, default: false },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "notifications",
    }
);

module.exports = mongoose.model("Notification", notificationSchema);
