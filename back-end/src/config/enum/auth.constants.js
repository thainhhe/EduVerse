const auth_enum = {
    VALIDATOR_SCHEMA: {
        // USERNAME
        MIN_USERNAME: "Username must be at least 3 characters long.",
        MAX_USERNAME: "Username cannot exceed 30 characters.",
        REQUIRED_USERNAME: "Username is required.",

        // EMAIL
        INVALID_EMAIL: "Please enter a valid email address.",
        REQUIRED_EMAIL: "Email is required.",

        // PASSWORD
        MIN_PASSWORD: "Password must be at least 6 characters long.",
        MAX_PASSWORD: "Password cannot exceed 50 characters.",
        REQUIRED_PASSWORD: "Password is required.",
    },

    AUTH_MESSAGE: {
        // SUCCESS
        LOGIN_SUCCESS: "Login successful.",
        REGISTER_SUCCESS: "Registration completed successfully.",
        CHANGE_PASSWORD_SUCCESS: "Password changed successfully.",

        // FAIL
        EXISTING_EMAIL: "This email is already registered.",
        USER_NOT_FOUND: "User not found.",
        WRONG_PASSWORD: "Incorrect password. Please try again.",
        MISSING_INFORMATION: "Missing user information.",
    },
};

module.exports = { auth_enum };
