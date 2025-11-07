const reviewHelper = {
    cleanedReviewData: (data) => {
        if (!data) return data;
        const cleaned = {
            ...data,
            comment: data.comment?.trim(),
        };
        return cleaned;
    },

    formatReviewForResponse: (review) => {
        return {
            id: review.id,
            userId: review.userId,
            courseId: review.courseId,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
        };
    },
};

module.exports = reviewHelper;