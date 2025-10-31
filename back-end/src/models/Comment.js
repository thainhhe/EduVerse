const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    forumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Forum",
      required: true,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    content: { type: String, required: true },
    childComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    reported: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: String,
      },
    ],

    status: {
      type: String,
      enum: ["visible", "hidden", "deleted"],
      default: "visible",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "comments",
  }
);

module.exports = mongoose.model("Comment", commentSchema);
