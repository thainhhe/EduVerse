const mongoose = require("mongoose");
const Permission = require("./Permission");

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        avatar: { type: String, default: null },
        role: { type: String, enum: ["learner", "instructor", "admin"], default: "learner" },
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
