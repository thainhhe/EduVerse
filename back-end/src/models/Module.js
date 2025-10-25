const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        content: { type: String },
        order: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "modules",
    }
);

module.exports = mongoose.model("Module", moduleSchema);
