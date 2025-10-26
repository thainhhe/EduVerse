const mongoose = require("mongoose");
const Module = require("./Module");

const lessonSchema = new mongoose.Schema(
    {
        moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
        title: { type: String, required: true },
        content: { type: String },
        type: { type: String, enum: ["video", "article", "quiz"], default: "article" },
        order: { type: Number, required: true },
        user_completed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        materials: [{ type: mongoose.Schema.Types.ObjectId, ref: "Material" }],
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", default: "" },
        status: { type: String, enum: ["published", "hidden"], default: "hidden" },
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
