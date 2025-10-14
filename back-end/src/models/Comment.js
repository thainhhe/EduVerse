const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        forumId: { type: mongoose.Schema.Types.ObjectId, ref: "Forum", required: true },
        content: { type: String, required: true },
        childComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "comments",
    }
);

module.exports = mongoose.model("Comment", commentSchema);
