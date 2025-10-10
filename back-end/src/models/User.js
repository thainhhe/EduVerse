const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["learner", "instructor", "admin"], default: "learner" },
        permissions: { type: [String], default: ["read"], enum: ["read", "write", "delete"] },
        status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "users",
    }
);

module.exports = mongoose.model("User", userSchema);
