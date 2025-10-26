const module_enum = {
    VALIDATE_SCHEMA: {
        STATUS: ["draft", "published", "hidden"],
    },

    MODULE_MESSAGE: {
        REQUIRED_TITLE: "Lesson title is required.",
        REQUIRED_COURSE_ID: "Course id is required.",
        MIN_TITLE: "Lesson title must be at least 3 characters long.",
        MAX_TITLE: "Title must not exceed 200 characters.",
        MAX_DESCRIPTION: "Description must not exceed 500 characters.",
        MAX_CONTENT: "Content must not exceed 5000 characters.",
        REQUIRED_ORDER: "Lesson order is required.",
        ORDER_INVALID: "Order must be an integer.",
        INVALID_OBJECT_ID: "Invalid ID format.",
        INVALID_STATUS: "Status must be either draft, published or hidden.",
        GET_DATA_SUCCESS: "Get data information successfully.",
        CREATE_SUCCESS: "Module created successfully.",
        UPDATE_SUCCESS: "Module updated successfully.",
        DELETE_SUCCESS: "Module deleted successfully.",
        NOT_FOUND: "Module not found.",
    },
};

module.exports = { module_enum };
