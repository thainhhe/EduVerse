const course_enum = {
    VALIDATE_SCHEMA: {
        STATUS: ["pending", "approve", "reject"],
        DURATION_UNIT: ["day", "month", "year"],
    },

    COURSE_MESSAGE: {
        // Validation
        REQUIRED_TITLE: "Course title is required.",
        MIN_TITLE: "Course title must be at least 3 characters long.",
        MAX_TITLE: "Course title must not exceed 200 characters.",
        INVALID_DURATION: "Duration value must be a positive number",
        INVALID_TOTAL_ENROLLMENT: "Total enrollments cannot be negative",
        INVALID_PRICE: "Course price must be a positive number.",
        INVALID_RATING: "Rating must be between 0 and 5.",
        INVALID_STATUS: "Status must be one of: pending, approve, or reject.",
        INVALID_DURATION_UNIT: "Duration unit must be one of: day, month, or year.",
        REQUIRED_MAIN_INSTRUCTOR: "Main instructor is required.",
        INVALID_OBJECT_ID: "Invalid ID format.",

        // CRUD
        GET_DATA_SUCCESS: "Get data information successfully.",
        CREATE_SUCCESS: "Course created successfully.",
        UPDATE_SUCCESS: "Course updated successfully.",
        DELETE_SUCCESS: "Course deleted successfully.",
        NOT_FOUND: "Course not found.",
    },
};

module.exports = { course_enum };
