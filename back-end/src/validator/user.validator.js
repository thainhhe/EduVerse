const yup = require("yup");

const userSchema = yup.object({
    username: yup
        .string()
        .trim()
        .min(2, "Tên người dùng phải có ít nhất 2 ký tự")
        .max(50, "Tên người dùng không được vượt quá 50 ký tự")
        .required("Tên người dùng là bắt buộc"),

    email: yup.string().trim().email("Email không hợp lệ").required("Email là bắt buộc"),

    password: yup.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").max(50, "Mật khẩu không được vượt quá 50 ký tự"),

    avatar: yup.string().nullable(),

    introduction: yup.string().max(1000, "Giới thiệu không quá 1000 ký tự").default(""),

    address: yup.string().max(255, "Địa chỉ không quá 255 ký tự").default(""),

    phoneNumber: yup.string().default(""),
    job_title: yup.string().oneOf(["manager", "professor", "instructor"], "Chức vụ không hợp lệ").default("instructor"),

    role: yup.string().oneOf(["learner", "instructor", "admin"], "Vai trò không hợp lệ").default("learner"),

    subject_instructor: yup.string().default(""),

    isSuperAdmin: yup.boolean().default(false),

    permissions: yup.array().default([]),

    status: yup.string().oneOf(["active", "inactive", "banned"], "Trạng thái không hợp lệ").default("active"),

    googleId: yup.string().nullable(),

    emailNotifications: yup.boolean().default(true),

    systemNotifications: yup.boolean().default(true),
});

module.exports = { userSchema };
