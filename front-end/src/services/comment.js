import api from "./api";

export const commentService = {
    getAllCommentCommon: async (forumId) => await api.get(`/comment/forum/${forumId}`),
    getAllCommentInstructor: async (forumId) => await api.get(`/comment/forum-instructor/${forumId}`),
    hiddenComment: async (commentId) => await api.post(`/comment/forum-instructor/hidden/${commentId}`),
};
