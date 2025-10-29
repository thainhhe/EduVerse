const enrollment_enum = {
    VALIDATOR_SCHEMA: {
        // PROGRESS
        MIN_PROGRESS: "Progress cannot be less than 0%.",
        MAX_PROGRESS: "Progress cannot exceed 100%.",

        // STATUS
        INVALID_STATUS: "Status must be one of the following: enrolled, completed, dropped.",
    },

    ENROLLMENT_MESSAGE: {
        // SUCCESS
        ENROLL_SUCCESS: "Enrollment successful.",
        UPDATE_SUCCESS: "Enrollment updated successfully.",
        DELETE_SUCCESS: "Enrollment deleted successfully.",

        // FAIL
        ENROLLMENT_NOT_FOUND: "Enrollment not found.",
        DUPLICATE_ENROLLMENT: "You are already enrolled in this course.",
    },
};

module.exports = { enrollment_enum };
  