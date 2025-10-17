const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        forumId: { type: mongoose.Schema.Types.ObjectId, ref: "Forum", required: true },
        content: { type: String, required: true },
        childComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
        reported: [{ user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, reason: String }],
        likes: { type: Number, default: 0, min: 0 },
        dislikes: { type: Number, default: 0, min: 0 },
        status: { type: String, enum: ["visible", "hidden", "deleted"], default: "visible" },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "comments",
    }
);

module.exports = mongoose.model("Comment", commentSchema);
