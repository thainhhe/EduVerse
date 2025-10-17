const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        avatar: { type: String },
        role: { type: String, enum: ["learner", "instructor", "admin"], default: "learner" },
        isSuperAdmin: { type: Boolean, default: false },
        permissions: [{ type: mongoose.Schema.ObjectId, ref: "Permission" }],
        status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
        googleId: { type: String, unique: true, sparse: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "users",
    }
);

module.exports = mongoose.model("User", userSchema);
