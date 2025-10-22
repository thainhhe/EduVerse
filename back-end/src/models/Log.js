const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        ipAddress: { type: String },
        responseTime: { type: Number },
        url: { type: String },
        method: { type: String },
        statusCode: { type: Number },
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
