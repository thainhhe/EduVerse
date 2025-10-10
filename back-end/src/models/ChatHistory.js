const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        messages: [
            {
                sender: { type: String, enum: ["user", "bot"], required: true },
                message: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
        collection: "chat_histories",
    }
);

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
