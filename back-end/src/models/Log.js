const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, required: true },
        details: { type: String },
        ipAddress: { type: String },
        userAgent: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "logs",
    }
);

module.exports = mongoose.model("Log", logSchema);
