const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    questions: [
      {
        questionText: { type: String, required: true },
        questionType: {
          type: String,
          enum: ["multiple_choice", "checkbox", "true_false"],
          default: "multiple_choice",
          required: true,
        },
        options: { type: [String], required: true },
        correctAnswer: { type: [String], required: true },
        explanation: { type: String },
        points: { type: Number, default: 1, min: 0 },
        order: { type: Number, required: true },
      },
    ],
    timeLimit: { type: Number, default: 0, min: 0 },
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    attemptsAllowed: { type: Number, default: 1, min: 1 },
    randomizeQuestions: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // scope refs: quiz can belong to exactly one of course/module/lesson
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      default: null,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "quizzes",
  }
);

// ensure index for fast lookup
quizSchema.index({ isPublished: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ courseId: 1 });
quizSchema.index({ moduleId: 1 });
quizSchema.index({ lessonId: 1 });

// validate that only one of courseId/moduleId/lessonId is set
quizSchema.pre("validate", function (next) {
  const refs = [this.courseId, this.moduleId, this.lessonId].filter(
    (v) => v != null && v !== ""
  );
  if (refs.length > 1) {
    return next(
      new Error(
        "Quiz must be attached to at most one of courseId, moduleId, or lessonId."
      )
    );
  }
  next();
});

module.exports = mongoose.model("Quiz", quizSchema);
