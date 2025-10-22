const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        link: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        startTime: { type: Date, default: Date.now },
        endTime: { type: Date },
    },
    {
        timestamps: true,
        collection: "rooms",
    }
);

module.exports = mongoose.model("Room", roomSchema);
