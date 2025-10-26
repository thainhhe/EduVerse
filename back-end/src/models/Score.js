const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
        score: { type: Number, required: true, min: 0 },
        totalPoints: { type: Number, required: true },
        percentage: { type: Number, min: 0, max: 100 },
        answers: [
            {
                questionId: { type: mongoose.Schema.Types.ObjectId },
                userAnswer: { type: [String] },
                isCorrect: { type: Boolean },
                pointsEarned: { type: Number, default: 0 }
            }
        ],
        timeTaken: { type: Number, default: 0 },
        attemptNumber: { type: Number, default: 1, min: 1 },
        dateSubmitted: { type: Date, default: Date.now },
        remarks: { type: String },
        status: {
            type: String,
            enum: ["passed", "failed", "incomplete"],
            default: "incomplete"
        },
    },
    {
        timestamps: true,
        collection: "scores",
    }
);

scoreSchema.index({ userId: 1, quizId: 1, attemptNumber: 1 }, { unique: true });
scoreSchema.index({ quizId: 1, status: 1 });

scoreSchema.pre('save', function (next) {
    if (this.totalPoints > 0) {
        this.percentage = Math.round((this.score / this.totalPoints) * 100);
    }
    next();
});

module.exports = mongoose.model("Score", scoreSchema);