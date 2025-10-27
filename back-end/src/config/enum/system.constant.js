const system_enum = {
  SYSTEM_MESSAGE: {
    DB_CONNECTION_FAILED: "Database connection failed.",
    SERVER_ERROR: "Internal server error.",
    NOT_FOUND: "The system did not find the data.",
    UNKNOWN_ERROR: "An unknown error occurred.",
    SUCCESS: "Operation successful.",
    INVALID_INPUT: "Input data invalid.",
  },

  STATUS_CODE: {
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
  },
};
module.exports = {
  STATUS_CODE: system_enum.STATUS_CODE,
  SYSTEM_MESSAGE: system_enum.SYSTEM_MESSAGE,
  system_enum,
};
