const { STATUS_CODE, INPUT_ERROR } = require("../config/enum");

const response = (res, result) => {
  console.log("res, result", result);
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data,
  });
};

const error_response = (res, error) => {
  return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || "Internal server error",
  });
};

const validate_schema = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    return res.status(STATUS_CODE.BAD_REQUEST).json({
      message: INPUT_ERROR.INVALID_INPUT,
      errors: err.errors,
    });
  }
};

module.exports = { response, error_response, validate_schema };
