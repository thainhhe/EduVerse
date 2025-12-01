import api from "./api";

export const reviewService = {
    getReviewByCourseId: async (courseId) => await api.get(`review/course/${courseId}`),
    addReview: async (data) => await api.post("/review", data),
    updateReview: async (id, data) => await api.put(`/review/${id}`, data),
    deleteReview: async (id, data) => await api.delete(`/review/${id}`, data),
};
