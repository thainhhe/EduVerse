const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        score: { type: Number, required: true },
        timeTaken: { type: Number, default: 0 },
        dateSubmitted: { type: Date, default: Date.now },
        remarks: { type: String },
        status: { type: String, enum: ["passed", "failed", "incomplete"], default: "incomplete" },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "scores",
    }
);

module.exports = mongoose.model("Score", scoreSchema);
