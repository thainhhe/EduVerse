const review_enum = {
    VALIDATOR_SCHEMA: {
        // RATING
        MIN_RATING: "Rating must be at least 1.",
        MAX_RATING: "Rating cannot exceed 5.",
        REQUIRED_RATING: "Rating is required.",

        // COMMENT
        MAX_COMMENT: "Comment cannot exceed 500 characters.",
    },

    REVIEW_MESSAGE: {
        // SUCCESS
        CREATE_SUCCESS: "Review created successfully.",
        UPDATE_SUCCESS: "Review updated successfully.",
        DELETE_SUCCESS: "Review deleted successfully.",

        // FAIL
        REVIEW_NOT_FOUND: "Review not found.",
        DUPLICATE_REVIEW: "You have already reviewed this course.",
    },
};

module.exports = { review_enum };

