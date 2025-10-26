const lesson_enum = {
    VALIDATE_SCHEMA: {
        TYPE: ["video", "article", "quiz"],
        STATUS: ["published", "hidden"],
    },

    LESSON_MESSAGE: {
        REQUIRED_TITLE: "Lesson title is required.",
        MIN_TITLE: "Lesson title must be at least 3 characters long.",
        MAX_TITLE: "Title must not exceed 200 characters.",
        DURATION_MIN: "Duration must not be less than 0.",
        REQUIRED_ORDER: "Lesson order is required.",
        ORDER_INVALID: "Order must be an integer.",
        INVALID_OBJECT_ID: "Invalid ID format.",
        INVALID_TYPE: "Lesson type must be either video, article, or quiz.",
        INVALID_STATUS: "Status must be either published or hidden.",
        GET_DATA_SUCCESS: "Get data information successfully.",
        CREATE_SUCCESS: "Lesson created successfully.",
        UPDATE_SUCCESS: "Lesson updated successfully.",
        DELETE_SUCCESS: "Lesson deleted successfully.",
        NOT_FOUND: "Lesson not found.",
    },
};

module.exports = { lesson_enum };
