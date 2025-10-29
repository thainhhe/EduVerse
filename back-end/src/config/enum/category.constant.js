const category_enum = {
    VALIDATOR_SCHEMA: {
        MIN_NAME: "Category name must be at least 3 characters long.",
        MAX_NAME: "Category name cannot exceed 50 characters.",
        REQUIRED_NAME: "Category name is required.",
        MAX_DESCRIPTION: "Category description cannot exceed 200 characters.",
        REQUIRED_DESCRIPTION: "Category description is required.",
    },

    CATEGORY_MESSAGE: {
        CREATE_SUCCESS: "Category created successfully.",
        UPDATE_SUCCESS: "Category updated successfully.",
        DELETE_SUCCESS: "Category deleted successfully.",
        CATEGORY_NOT_FOUND: "Category not found.",
        DUPLICATE_CATEGORY: "A category with this name already exists.",
    },
};

module.exports = { category_enum };