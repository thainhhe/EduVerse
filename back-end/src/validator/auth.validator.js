const yup = require("yup");
const { auth_enum } = require("../config/enum/auth.constants");

const registerSchema = yup.object({
    username: yup
        .string()
        .trim()
        .min(2, auth_enum.VALIDATOR_SCHEMA.MIN_USERNAME)
        .max(50, auth_enum.VALIDATOR_SCHEMA.MAX_USERNAME)
        .required(auth_enum.VALIDATOR_SCHEMA.REQUIRED_USERNAME),

    email: yup
        .string()
        .trim()
        .email(auth_enum.VALIDATOR_SCHEMA.INVALID_EMAIL)
        .required(auth_enum.VALIDATOR_SCHEMA.REQUIRED_EMAIL),

    password: yup
        .string()
        .min(6, auth_enum.VALIDATOR_SCHEMA.MIN_PASSWORD)
        .max(50, auth_enum.VALIDATOR_SCHEMA.MAX_PASSWORD)
        .required(auth_enum.VALIDATOR_SCHEMA.REQUIRED_PASSWORD),
});

const loginSchema = yup.object({
    email: yup
        .string()
        .trim()
        .email(auth_enum.VALIDATOR_SCHEMA.INVALID_EMAIL)
        .required(auth_enum.VALIDATOR_SCHEMA.REQUIRED_EMAIL),
    password: yup
        .string()
        .min(6, auth_enum.VALIDATOR_SCHEMA.MIN_PASSWORD)
        .max(50, auth_enum.VALIDATOR_SCHEMA.MAX_PASSWORD)
        .required(auth_enum.VALIDATOR_SCHEMA.REQUIRED_PASSWORD),
});

const changePassSchema = yup.object({
    newPassword: yup
        .string()
        .min(6, auth_enum.VALIDATOR_SCHEMA.MIN_PASSWORD)
        .max(50, auth_enum.VALIDATOR_SCHEMA.MAX_PASSWORD)
        .required(auth_enum.VALIDATOR_SCHEMA.REQUIRED_PASSWORD),
});

module.exports = {
    registerSchema,
    loginSchema,
    changePassSchema,
};
