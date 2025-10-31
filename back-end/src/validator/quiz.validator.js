const yup = require("yup");

const quizValidator = {
  questionSchema: yup.object().shape({
    questionText: yup.string().required("Question text is required"),
    questionType: yup
      .string()
      .oneOf(
        ["multiple_choice", "checkbox", "true_false"],
        "Invalid question type"
      )
      .required("Question type is required"),
    options: yup
      .array()
      .of(yup.string())
      .min(2, "At least 2 options required")
      .required("Options are required"),
    correctAnswer: yup
      .array()
      .of(yup.string())
      .min(1, "At least one correct answer required")
      .required("Correct answer is required"),
    explanation: yup.string().notRequired(),
    points: yup.number().min(0, "Points must be positive").default(1),
    order: yup.number().required("Question order is required"),
  }),

  createQuizSchema: yup.object().shape({
    title: yup.string().required("Quiz title is required"),
    description: yup.string().notRequired(),
    questions: yup
      .array()
      .of(yup.lazy(() => quizValidator.questionSchema))
      .min(1, "At least one question required")
      .required("Questions are required"),
    // optional scope refs (must be 24-hex ObjectId strings if provided)
    courseId: yup
      .string()
      .matches(/^[0-9a-fA-F]{24}$/, "Invalid courseId")
      .notRequired(),
    moduleId: yup
      .string()
      .matches(/^[0-9a-fA-F]{24}$/, "Invalid moduleId")
      .notRequired(),
    lessonId: yup
      .string()
      .matches(/^[0-9a-fA-F]{24}$/, "Invalid lessonId")
      .notRequired(),
    timeLimit: yup.number().min(0, "Time limit must be positive").default(0),
    passingScore: yup
      .number()
      .min(0, "Passing score must be between 0-100")
      .max(100, "Passing score must be between 0-100")
      .default(70),
    attemptsAllowed: yup
      .number()
      .min(1, "At least 1 attempt allowed")
      .default(1),
    randomizeQuestions: yup.boolean().default(false),
    showCorrectAnswers: yup.boolean().default(true),
    isPublished: yup.boolean().default(false),
    createdBy: yup.string().notRequired(),
  }),

  updateQuizSchema: yup.object().shape({
    title: yup.string().notRequired(),
    description: yup.string().notRequired(),
    questions: yup
      .array()
      .of(yup.lazy(() => quizValidator.questionSchema))
      .notRequired(),
    timeLimit: yup.number().min(0).notRequired(),
    passingScore: yup.number().min(0).max(100).notRequired(),
    attemptsAllowed: yup.number().min(1).notRequired(),
    randomizeQuestions: yup.boolean().notRequired(),
    showCorrectAnswers: yup.boolean().notRequired(),
    isPublished: yup.boolean().notRequired(),
  }),

  validateQuizData: (data, isUpdate = false) => {
    const schema = isUpdate
      ? quizValidator.updateQuizSchema
      : quizValidator.createQuizSchema;
    try {
      const validatedData = schema.validateSync(data, {
        abortEarly: false,
        stripUnknown: true,
      });

      // cross-field rule: at most one of courseId/moduleId/lessonId allowed
      const scopeFields = ["courseId", "moduleId", "lessonId"];
      const provided = scopeFields.filter((f) => !!validatedData[f]);
      if (provided.length > 1) {
        const error = new Error("Validation failed");
        error.isValidation = true;
        error.validationErrors = [
          {
            field: "scope",
            message: "Provide at most one of courseId, moduleId, or lessonId",
          },
        ];
        throw error;
      }

      return validatedData;
    } catch (validationError) {
      // Normalize errors whether thrown by Yup or by our custom checks
      let errors = [];
      if (
        Array.isArray(validationError.inner) &&
        validationError.inner.length > 0
      ) {
        errors = validationError.inner.map((err) => ({
          field: err.path,
          message: err.message,
        }));
      } else if (Array.isArray(validationError.validationErrors)) {
        errors = validationError.validationErrors;
      } else {
        errors = [
          {
            field: null,
            message: validationError.message || "Validation failed",
          },
        ];
      }
      const error = new Error("Validation failed");
      error.validationErrors = errors;
      error.isValidation = true;
      throw error;
    }
  },
};

module.exports = quizValidator;
