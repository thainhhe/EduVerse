const Comment = require("../../models/Comment");
const Forum = require("../../models/Forum");
const User = require("../../models/User");
const { commentService } = require("../../services/comment/comment.service");
const { response, error_response } = require("../../utils/response.util");

const commentController = {
  async getCommentsByForum(req, res) {
    try {
      const forumId = req.params.forumId;
      console.log("forumId", forumId);
      const result = await commentService.getCommentsByForum(forumId);
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },

  async createComment(req, res) {
    try {
      const data = req.body;
      const userId = req.user?._id || req.body.userId;
      const result = await commentService.createComment(data, userId);
      return response(res, result, 201);
    } catch (error) {
      return error_response(res, error);
    }
  },

  async updateComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?._id || req.body.userId;

      const result = await commentService.updateComment(id, userId, content);
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },

  async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?._id || req.body.userId;

      const result = await commentService.deleteComment(id, userId);
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },

  // 🟢 Like / Dislike comment
  async likeComment(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body;

      const result = await commentService.reactComment(id, action);

      // Nếu service trả lỗi (not found, bad request, ...)
      if (!result.success) {
        return error_response(res, result, result.status);
      }

      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },

  // 🟢 Báo cáo comment
  async reportComment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user?._id || req.body.userId;

      const comment = await Comment.findById(id);
      if (!comment) return error_response(res, "Comment không tồn tại", 404);

      // Kiểm tra đã báo cáo chưa
      const alreadyReported = comment.reported.some(
        (r) => r.user_id.toString() === userId.toString()
      );
      if (alreadyReported)
        return error_response(res, "Bạn đã báo cáo comment này rồi", 400);

      comment.reported.push({ user_id: userId, reason });
      await comment.save();

      return response(res, { message: "Đã gửi báo cáo" });
    } catch (error) {
      return error_response(res, error);
    }
  },
};

module.exports = { commentController };
