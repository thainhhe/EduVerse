const mongoose = require("mongoose");

const forumSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "forums",
    }
);
module.exports = mongoose.model("Forum", forumSchema);
