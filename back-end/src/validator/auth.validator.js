const yup = require("yup");
const { INPUT_ERROR, AUTH_VALIDATE_MESSAGE } = require("../config/enum");

const registerSchema = yup.object({
    username: yup
        .string()
        .trim()
        .min(2, "Tên phải có ít nhất 2 ký tự")
        .max(50, "Tên không được vượt quá 50 ký tự")
        .required("Tên không được để trống"),

    email: yup.string().trim().email("Email không hợp lệ").required("Email không được để trống"),

    password: yup
        .string()
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
        .max(50, "Mật khẩu không được vượt quá 50 ký tự")
        .required("Mật khẩu không được để trống"),
    // confirmPassword: yup
    //     .string()
    //     .oneOf([yup.ref("password"), null], "Mật khẩu xác nhận không khớp")
    //     .required("Vui lòng xác nhận mật khẩu"),
});

const loginSchema = yup.object({
    email: yup.string().trim().email(INPUT_ERROR.INVALID_EMAIL).required(INPUT_ERROR.MISSING_FIELDS),
    password: yup
        .string()
        .required(INPUT_ERROR.MISSING_FIELDS)
        .min(6, AUTH_VALIDATE_MESSAGE.PASSWORD_MIN)
        .max(50, AUTH_VALIDATE_MESSAGE.PASSWORD_MAX),
});

module.exports = {
    registerSchema,
    loginSchema,
};
