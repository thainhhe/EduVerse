const express = require("express");
const {
  commentController,
} = require("../controllers/comment/comment.controller");

const commentRouter = express.Router();

/**
 * 🟢 Lấy tất cả comment theo forumId
 * GET /api/comments/forum/:forumId
 */
commentRouter.get("/forum/:forumId", commentController.getCommentsByForum);

/**
 * 🟢 Tạo mới comment
 * POST /api/comments
 */
commentRouter.post("/create-comment", commentController.createComment);

/**
 * 🟢 Trả lời comment (reply)
 * POST /api/comments/:parentCommentId/reply
 */
// commentRouter.post("/:parentCommentId/reply", commentController.replyComment);

/**
 * 🟢 Cập nhật comment
 * PUT /api/comments/:id
 */
commentRouter.put("/:id", commentController.updateComment);

/**
 * 🟢 Xóa (ẩn) comment
 * DELETE /api/comments/:id
 */
commentRouter.delete("/:id", commentController.deleteComment);

/**
 * 🟢 Like / Dislike comment
 * POST /api/comments/:id/reaction
 * body: { action: "like" | "dislike" }
 */
commentRouter.post("/:id/reaction", commentController.likeComment);

/**
 * 🟢 Báo cáo comment
 * POST /api/comments/:id/report
 * body: { reason: string }
 */
commentRouter.post("/:id/report", commentController.reportComment);

module.exports = commentRouter;
