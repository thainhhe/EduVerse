const report_enum = {
    VALIDATOR_SCHEMA: {
        // ISSUE TYPE
        REQUIRED_ISSUE_TYPE: "Issue type is required.",
        INVALID_ISSUE_TYPE: "Invalid issue type. Allowed types are: bug, feature, other.",

        // DESCRIPTION
        REQUIRED_DESCRIPTION: "Description is required.",
        MAX_DESCRIPTION: "Description cannot exceed 1000 characters.",

        // FILE ATTACHMENT (IMAGES, DOCS, ETC.)
        INVALID_FILE_ATTACHMENT: "File attachment must be an array of strings (URLs or file paths).",
        MAX_FILE_ATTACHMENT: "File attachment cannot exceed 5 files.",
    },

    REPORT_MESSAGE: {
        // SUCCESS
        CREATE_SUCCESS: "Issue report created successfully.",
        UPDATE_SUCCESS: "Issue report updated successfully.",
        DELETE_SUCCESS: "Issue report deleted successfully.",

        // FAIL
        REPORT_NOT_FOUND: "Issue report not found.",
        ERROR_UPLOADING_FILE: "Error uploading file attachment.",
    },
};

module.exports = { report_enum };
