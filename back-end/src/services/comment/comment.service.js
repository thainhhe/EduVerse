const Comment = require("../../models/Comment");
const Forum = require("../../models/Forum");
const User = require("../../models/User");
const {
  STATUS_CODE,
  SYSTEM_MESSAGE,
  COMMENT_ERROR_MESSAGE,
} = require("../../config/enum/index");
const flattenToLevel3 = (comment, level = 1) => {
  // Nếu đang ở cấp 3
  if (level === 2) {
    const deepChildren = [];

    // Hàm đệ quy gom toàn bộ con cháu sâu hơn
    const collectDeepChildren = (node) => {
      if (!node.childComments) return;
      node.childComments.forEach((child) => {
        deepChildren.push(child);
        collectDeepChildren(child);
      });
    };

    // Gom toàn bộ con sâu hơn cấp 3
    comment.childComments.forEach((child) => collectDeepChildren(child));

    // Bỏ cây cũ, chỉ giữ unique
    const uniqueChildren = [];
    const seen = new Set();
    [...comment.childComments, ...deepChildren].forEach((c) => {
      if (!seen.has(c._id.toString())) {
        seen.add(c._id.toString());
        uniqueChildren.push(c);
      }
    });

    comment.childComments = uniqueChildren;
  } else {
    comment.childComments.forEach((child) => flattenToLevel3(child, level + 1));
  }

  return comment;
};
const commentService = {
  async createComment(data) {
    try {
      const { forumId, userId, content, parentCommentId } = data;

      // Kiểm tra forum tồn tại
      const forum = await Forum.findById(forumId);
      if (!forum) {
        return {
          status: STATUS_CODE.NOT_FOUND,
          message: "Forum không tồn tại",
        };
      }

      // Kiểm tra user tồn tại
      const user = await User.findById(userId);
      if (!user) {
        return {
          status: STATUS_CODE.NOT_FOUND,
          message: "User không tồn tại",
        };
      }

      // Tạo comment mới
      const newComment = await Comment.create({
        forumId,
        userId,
        content,
        parentCommentId: parentCommentId || null,
      });

      // Nếu là reply → thêm vào childComments của comment cha
      if (parentCommentId) {
        const parent = await Comment.findById(parentCommentId);
        if (parent) {
          parent.childComments.push(newComment._id);
          await parent.save();
        }
      }

      // 🔹 Populate user để frontend có email ngay lập tức
      const populatedComment = await Comment.findById(newComment._id)
        .populate("userId", "email name avatar")
        .populate({
          path: "childComments",
          populate: { path: "userId", select: "email name avatar" },
        });

      return {
        status: STATUS_CODE.OK,
        message: "Tạo comment thành công",
        data: populatedComment,
        success: true,
      };
    } catch (error) {
      throw new Error(error);
    }
  },

  // 🟦 Lấy tất cả comment theo forumId
  // async getCommentsByForum(forumId) {
  //   console.log("forumId", forumId);
  //   try {
  //     const comments = await Comment.find({ forumId, status: "visible" })
  //       .populate("userId", "name email avatar")
  //       .populate({
  //         path: "childComments",
  //         populate: { path: "userId", select: "name email avatar" },
  //       })
  //       .sort({ createdAt: -1 });

  //     return {
  //       status: STATUS_CODE.OK,
  //       message: SYSTEM_MESSAGE.SUCCESS,
  //       data: comments,
  //     };
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // },
  // async getCommentsByForum(forumId) {
  //   try {
  //     // 1️⃣ Lấy tất cả comment trong forum
  //     const comments = await Comment.find({ forumId, status: "visible" })
  //       .populate("userId", "name email avatar")
  //       .lean(); // dùng lean() để dễ xử lý dữ liệu JS thuần

  //     // 2️⃣ Tạo map để tra cứu comment nhanh
  //     const commentMap = {};
  //     comments.forEach((comment) => {
  //       comment.childComments = [];
  //       commentMap[comment._id.toString()] = comment;
  //     });

  //     // 3️⃣ Xây cây cha–con
  //     const rootComments = [];
  //     comments.forEach((comment) => {
  //       if (comment.parentCommentId) {
  //         const parent = commentMap[comment.parentCommentId.toString()];
  //         if (parent) {
  //           parent.childComments.push(comment);
  //         }
  //       } else {
  //         rootComments.push(comment);
  //       }
  //     });

  //     // 4️⃣ Trả về kết quả
  //     return {
  //       status: STATUS_CODE.OK,
  //       message: SYSTEM_MESSAGE.SUCCESS,
  //       data: rootComments, // chỉ trả về comment gốc, bên trong có children
  //     };
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // },

  async getCommentsByForum(forumId) {
    try {
      const comments = await Comment.find({ forumId, status: "visible" })
        .populate("userId", "name email avatar")
        .lean();

      const commentMap = {};
      comments.forEach((c) => {
        c.childComments = [];
        commentMap[c._id.toString()] = c;
      });

      const rootComments = [];
      comments.forEach((c) => {
        if (c.parentCommentId) {
          const parent = commentMap[c.parentCommentId.toString()];
          if (parent) parent.childComments.push(c);
        } else {
          rootComments.push(c);
        }
      });

      // 🔥 Gọi flattenToLevel3
      const result = rootComments.map((c) => flattenToLevel3(c));

      return {
        status: STATUS_CODE.OK,
        message: SYSTEM_MESSAGE.SUCCESS,
        data: result,
      };
    } catch (error) {
      throw new Error(error);
    }
  },
  // 🟢 Update comment
  async updateComment(id, userId, content) {
    try {
      const comment = await Comment.findById(id);
      console.log("comment", comment);
      if (!comment)
        return {
          status: STATUS_CODE.NOT_FOUND,
          message: "Comment không tồn tại",
        };

      if (comment.userId.toString() !== userId.toString()) {
        console.log("hú hú", comment.userId.toString(), userId.toString());
        return {
          status: STATUS_CODE.FORBIDDEN,
          message: "Bạn không có quyền sửa comment này",
        };
      }

      comment.content = content || comment.content;
      comment.updatedAt = new Date();
      await comment.save();

      return {
        status: STATUS_CODE.OK,
        success: true,
        message: "Cập nhật comment thành công",
        data: comment,
      };
    } catch (error) {
      throw new Error(error);
    }
  },

  // 🟣 Delete comment
  // async deleteComment(id, userId) {
  //   try {
  //     const comment = await Comment.findById(id);
  //     if (!comment)
  //       return {
  //         status: STATUS_CODE.NOT_FOUND,
  //         message: "Comment không tồn tại",
  //       };

  //     if (comment.userId.toString() !== userId.toString()) {
  //       return {
  //         status: STATUS_CODE.FORBIDDEN,
  //         message: "Bạn không có quyền xóa comment này",
  //       };
  //     }

  //     comment.status = "deleted";
  //     await comment.save();

  //     return {
  //       status: STATUS_CODE.OK,
  //       message: "Đã xóa comment",
  //     };
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // },
  async deleteComment(id, userId) {
    try {
      const comment = await Comment.findById(id);
      if (!comment)
        return {
          status: STATUS_CODE.NOT_FOUND,
          message: "Comment không tồn tại",
        };

      if (comment.userId.toString() !== userId.toString()) {
        return {
          status: STATUS_CODE.FORBIDDEN,
          message: "Bạn không có quyền xóa comment này",
        };
      }

      // Gọi hàm đệ quy xóa các comment con
      await this._deleteChildComments(comment._id);

      // Đánh dấu comment cha là deleted
      comment.status = "deleted";
      await comment.save();

      return {
        status: STATUS_CODE.OK,
        message: "Đã xóa comment và toàn bộ comment con",
      };
    } catch (error) {
      throw new Error(error);
    }
  },

  // ===== Hàm đệ quy =====
  async _deleteChildComments(parentId) {
    const childComments = await Comment.find({ parentCommentId: parentId });
    for (const child of childComments) {
      // Gọi lại chính hàm này để xử lý sâu hơn
      await this._deleteChildComments(child._id);
      child.status = "deleted";
      await child.save();
    }
  },

  // 🟨 Báo cáo comment
  async reportComment(commentId, userId, reason) {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return {
          status: STATUS_CODE.NOT_FOUND,
          message:
            COMMENT_ERROR_MESSAGE.COMMENT_NOT_FOUND || "Không tìm thấy comment",
        };
      }

      // Kiểm tra user đã report chưa
      const alreadyReported = comment.reported.some(
        (r) => r.user_id.toString() === userId
      );
      if (alreadyReported) {
        return {
          status: STATUS_CODE.CONFLICT,
          message: "Bạn đã báo cáo comment này rồi",
        };
      }

      comment.reported.push({ user_id: userId, reason });
      await comment.save();

      return {
        status: STATUS_CODE.OK,
        message: "Báo cáo comment thành công",
        data: comment,
      };
    } catch (error) {
      throw new Error(error);
    }
  },

  async reactComment(commentId, userId, action) {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return {
          status: STATUS_CODE.NOT_FOUND,
          message:
            COMMENT_ERROR_MESSAGE.COMMENT_NOT_FOUND || "Không tìm thấy comment",
        };
      }
      // Nếu người dùng có like trước đớ:
      const hasLiked = comment.likedBy.includes(userId);
      const hasDisliked = comment.dislikedBy.includes(userId);
      console.log("hasLiked", hasLiked);
      console.log("hasDisliked", hasDisliked);

      if (action === "like") {
        if (hasLiked) {
          comment.like -= 1;
          comment.likedBy.pull(userId);
        } else {
          if (hasDisliked) {
            comment.like += 1;
          }
        }
      } else if (action === "dislike") comment.dislikes++;
      else
        return {
          status: STATUS_CODE.BAD_REQUEST,
          message: "Hành động không hợp lệ (chỉ nhận like/dislike)",
        };

      await comment.save();

      return {
        status: STATUS_CODE.OK,
        message: "Thao tác thành công",
        data: comment,
      };
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = { commentService };
