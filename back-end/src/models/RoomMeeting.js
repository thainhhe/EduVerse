const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        link: { type: String },
        password: { type: String, default: "" },
        isHostJoin: { type: Boolean, default: false },
        isPublic: { type: Boolean, default: false },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        startTime: { type: Date, default: Date.now },
        status: { type: String, enum: ["pending", "ongoing", "ended"], default: "pending" },
        endTime: { type: Date },
    },
    {
        timestamps: true,
        collection: "rooms",
    }
);

module.exports = mongoose.model("Room", roomSchema);
