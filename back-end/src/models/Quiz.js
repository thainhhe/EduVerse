const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
        questions: {
            type: [
                {
                    questionText: { type: String, required: true },
                    options: { type: [String], required: true },
                    correctAnswer: { type: String, required: true },
                    explanation: { type: String },
                    points: { type: Number, default: 1, min: 0 },
                    order: { type: Number, required: true },
                },
            ],
            default: [],
        },
        timeLimit: { type: Number, default: 0, min: 0 },
        passingScore: { type: Number, default: 0, min: 0, max: 100 },
        attemptsAllowed: { type: Number, default: 1, min: 1 },
        isPublished: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "quizzes",
    }
);

module.exports = mongoose.model("Quiz", quizSchema);
