/**
 * ========================================
 * 🔢 HTTP STATUS CODE
 * ========================================
 */
const STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
};

/**
 * ========================================
 * 👤 USER & AUTH ERRORS
 * ========================================
 */
const USER_ERROR_MESSAGE = {
    USER_NOT_FOUND: "User not found",
    USER_ALREADY_EXISTS: "User already exists",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "You do not have permission to perform this action",
    INVALID_ROLE: "Invalid user role",
};

const AUTH_ERROR_MESSAGE = {
    INVALID_CREDENTIALS: "Invalid email or password",
    TOKEN_EXPIRED: "Authentication token has expired",
    INVALID_TOKEN: "Invalid authentication token",
    ACCESS_DENIED: "Access denied",
};

/**
 * ========================================
 * 📘 COURSE / MODULE / LESSON ERRORS
 * ========================================
 */
const COURSE_ERROR_MESSAGE = {
    COURSE_NOT_FOUND: "Course not found",
    DUPLICATE_COURSE: "Course already exists",
    INVALID_COURSE_DATA: "Invalid course data provided",
    COURSE_INACTIVE: "This course is not active",
};

const MODULE_ERROR_MESSAGE = {
    MODULE_NOT_FOUND: "Module not found",
    DUPLICATE_MODULE: "Module already exists in this course",
    INVALID_MODULE_DATA: "Invalid module data provided",
};

const LESSON_ERROR_MESSAGE = {
    LESSON_NOT_FOUND: "Lesson not found",
    DUPLICATE_LESSON: "Lesson already exists in this module",
    INVALID_LESSON_DATA: "Invalid lesson data",
};

/**
 * ========================================
 * 📝 QUIZ / QUESTION / SCORE / RATING ERRORS
 * ========================================
 */
const QUIZ_ERROR_MESSAGE = {
    QUIZ_NOT_FOUND: "Quiz not found",
    INVALID_QUIZ_DATA: "Invalid quiz data",
    QUIZ_ALREADY_EXISTS: "Quiz already exists",
};

const QUESTION_ERROR_MESSAGE = {
    QUESTION_NOT_FOUND: "Question not found",
    INVALID_QUESTION_DATA: "Invalid question format or content",
};

const SCORE_ERROR_MESSAGE = {
    SCORE_NOT_FOUND: "Score not found",
    INVALID_SCORE_DATA: "Invalid score input",
};

const RATING_ERROR_MESSAGE = {
    RATING_NOT_FOUND: "Rating not found",
    INVALID_RATING_VALUE: "Rating value must be between 1 and 5",
};

/**
 * ========================================
 * 💬 COMMENT / MATERIAL / ENROLLMENT ERRORS
 * ========================================
 */
const COMMENT_ERROR_MESSAGE = {
    COMMENT_NOT_FOUND: "Comment not found",
    INVALID_COMMENT_DATA: "Invalid comment content",
    UNAUTHORIZED_COMMENT_DELETE: "You are not allowed to delete this comment",
};

const MATERIAL_ERROR_MESSAGE = {
    MATERIAL_NOT_FOUND: "Material not found",
    INVALID_FILE_FORMAT: "Invalid material file format",
    UPLOAD_FAILED: "Material upload failed",
};

const ENROLLMENT_ERROR_MESSAGE = {
    ENROLLMENT_NOT_FOUND: "Enrollment not found",
    ALREADY_ENROLLED: "User already enrolled in this course",
    COURSE_NOT_AVAILABLE: "Course is not available for enrollment",
};

/**
 * ========================================
 * 🧩 INPUT & VALIDATION ERRORS
 * ========================================
 */
const INPUT_ERROR = {
    MISSING_FIELDS: "Required fields are missing",
    INVALID_EMAIL: "Invalid email format",
    EXISTING_EMAIL: "Email already exists",
    INVALID_INPUT: "Invalid input data",
    INVALID_ID: "Invalid ID format",
    FILE_TOO_LARGE: "Uploaded file size is too large",
    INVALID_FILE_TYPE: "Unsupported file type",
};

const AUTH_VALIDATE_MESSAGE = {
    PASSWORD_MIN: "Password must be at least 6 characters",
    PASSWORD_MAX: "Password must not exceed 50 characters",
    USERNAME_MAX: "Name must not exceed 50 characters",
    USERNAME_MIN: "Name must be at least 2 characters",
};

/**
 * ========================================
 * ⚙️ SYSTEM MESSAGES
 * ========================================
 */
const SYSTEM_MESSAGE = {
    DB_CONNECTION_FAILED: "Database connection failed",
    SERVER_ERROR: "Internal server error",
    NOT_FOUND: "The system did not find the data",
    UNKNOWN_ERROR: "An unknown error occurred",
    SUCCESS: "Operation successful",
};

/**
 * ========================================
 * ✅ SUCCESS MESSAGES
 * ========================================
 */
const SUCCESS_MESSAGE = {
    USER_CREATED: "User created successfully",
    USER_UPDATED: "User updated successfully",
    USER_DELETED: "User deleted successfully",

    COURSE_CREATED: "Course created successfully",
    COURSE_UPDATED: "Course updated successfully",
    COURSE_DELETED: "Course deleted successfully",

    MODULE_CREATED: "Module created successfully",
    LESSON_COMPLETED: "Lesson completed successfully",

    QUIZ_CREATED: "Quiz created successfully",
    QUIZ_SUBMITTED: "Quiz submitted successfully",

    MATERIAL_UPLOADED: "Material uploaded successfully",
    COMMENT_ADDED: "Comment added successfully",
    COMMENT_DELETED: "Comment deleted successfully",

    ENROLLMENT_SUCCESS: "Enrollment completed successfully",
    SCORE_RECORDED: "Score recorded successfully",
};

module.exports = {
    STATUS_CODE,
    USER_ERROR_MESSAGE,
    AUTH_ERROR_MESSAGE,
    COURSE_ERROR_MESSAGE,
    MODULE_ERROR_MESSAGE,
    LESSON_ERROR_MESSAGE,
    QUIZ_ERROR_MESSAGE,
    QUESTION_ERROR_MESSAGE,
    SCORE_ERROR_MESSAGE,
    RATING_ERROR_MESSAGE,
    COMMENT_ERROR_MESSAGE,
    MATERIAL_ERROR_MESSAGE,
    ENROLLMENT_ERROR_MESSAGE,
    INPUT_ERROR,
    SYSTEM_MESSAGE,
    SUCCESS_MESSAGE,
    AUTH_VALIDATE_MESSAGE,
};
