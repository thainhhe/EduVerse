const mongoose = require("mongoose");
const Permission = require("./Permission");

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        avatar: { type: String, default: null },
        introduction: { type: String, default: "" },
        address: { type: String, default: "" },
        phoneNumber: {
            type: String,
            default: "",
            validate: {
                validator: function (v) {
                    if (!v) return true;
                    return /^(?:\+84|0)\d{9,10}$/.test(v);
                },
                message: "Số điện thoại không hợp lệ (phải bắt đầu bằng +84 hoặc 0)",
            },
        },
        job_title: { type: String, enum: ["manager", "professor", "instructor"], default: "instructor" },
        role: { type: String, enum: ["learner", "instructor", "admin"], default: "learner" },
        subject_instructor: { type: String, default: "" },
        isSuperAdmin: { type: Boolean, default: false },
        permissions: [{ type: mongoose.Schema.ObjectId, ref: "Permission" }],
        status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
        googleId: { type: String, unique: true, sparse: true },
        emailNotifications: { type: Boolean, default: true },
        systemNotifications: { type: Boolean, default: true },
        resetOtpHash: { type: String, default: null },
        resetOtpExpires: { type: Date, default: null },
        resetOtpAttempts: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "users",
    }
);

module.exports = mongoose.model("User", userSchema);
