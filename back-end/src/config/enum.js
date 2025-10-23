const STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};

const USER_ERROR_MESSAGE = {
    USER_NOT_FOUND: "User not found",
    UNAUTHORIZED: "Unauthorized access",
};

const AUTH_ERROR_MESSAGE = {
    INVALID_CREDENTIALS: "Invalid password",
    TOKEN_EXPIRED: "Authentication token has expired",
    INVALID_TOKEN: "Invalid authentication token",
};

const SYSTEM_ERROR_MESSAGE = {
    DB_CONNECTION_FAILED: "Database connection failed",
    SERVER_ERROR: "Internal server error",
    UNKNOWN_ERROR: "An unknown error occurred",
};

const SuccessMessage = {
    USER_CREATED: "User created successfully",
    USER_UPDATED: "User updated successfully",
    USER_DELETED: "User deleted successfully",
};

const INPUT_ERROR = {
    MISSING_FIELDS: "Required fields are missing",
    INVALID_EMAIL: "Invalid email format",
    EXISTING_EMAIL: "Email already exists",
    INVALID_INPUT: "Invalid input data",
};



module.exports = { STATUS_CODE, USER_ERROR_MESSAGE, SYSTEM_ERROR_MESSAGE, INPUT_ERROR, AUTH_ERROR_MESSAGE };
