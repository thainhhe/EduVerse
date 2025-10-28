const material_enum = {
    VALIDATOR_SCHEMA: {
        INVALID_TYPE: "Type must be video, document, or link.",
        TITLE_REQUIRED: "Title is required.",
        URL_REQUIRED: "URL is required for link type.",
    },

    MATERIAL_MESSAGE: {
        // SUCCESS
        CREATE_SUCCESS: "Material created successfully.",
        UPDATE_SUCCESS: "Material updated successfully.",
        DELETE_SUCCESS: "Material deleted successfully.",
        GET_SUCCESS: "Get materials successfully.",

        // FAIL
        MATERIAL_NOT_FOUND: "Material not found.",
        INVALID_FILE: "Invalid file format or size.",
    },
};

module.exports = { material_enum };
