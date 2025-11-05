const yup = require("yup");

const userSchema = yup.object({
    username: yup
        .string()
        .trim()
        .min(2, "Username must be at least 2 characters long")
        .max(50, "Username cannot exceed 50 characters")
        .required("Username is required"),

    email: yup.string().trim().email("Invalid email address").required("Email is required"),

    password: yup
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(50, "Password cannot exceed 50 characters"),

    avatar: yup.string().nullable(),

    introduction: yup.string().max(1000, "Introduction cannot exceed 1000 characters").default(""),

    address: yup.string().max(255, "Address cannot exceed 255 characters").default(""),

    phoneNumber: yup.string().default(""),

    job_title: yup.string().oneOf(["manager", "professor", "instructor"], "Invalid job title").default("instructor"),

    role: yup.string().oneOf(["learner", "instructor", "admin"], "Invalid role").default("learner"),

    subject_instructor: yup.string().default(""),

    isSuperAdmin: yup.boolean().default(false),

    permissions: yup.array().default([]),

    status: yup.string().oneOf(["active", "inactive", "banned"], "Invalid status").default("active"),

    googleId: yup.string().nullable(),

    emailNotifications: yup.boolean().default(true),

    systemNotifications: yup.boolean().default(true),
});

module.exports = { userSchema };
