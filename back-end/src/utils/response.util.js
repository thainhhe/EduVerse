const { system_enum } = require("../config/enum/system.constant");

const response = (res, result) => {
    return res.status(result.status || 200).json({
        success: result.success ?? result.status < 400,
        message: result.message || "",
        data: result.data ?? null,
    });
};

const error_response = (res, error) => {
    return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal server error",
    });
};

const validate_schema = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (err) {
        return res.status(system_enum.STATUS_CODE.BAD_REQUEST).json({
            message: system_enum.SYSTEM_MESSAGE.INVALID_INPUT,
            errors: err.errors,
        });
    }
};

module.exports = { response, error_response, validate_schema };
