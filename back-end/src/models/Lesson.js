const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String },
        moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
        type: { type: String, enum: ["video", "article", "quiz"], default: "article" },
        duration: { type: Number, default: 0, min: 0 },
        order: { type: Number, required: true },
        user_completed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        resources: { type: [String], default: [] },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "lessons",
    }
);

module.exports = mongoose.model("Lesson", lessonSchema);
