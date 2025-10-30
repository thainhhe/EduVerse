const yup = require("yup");

const scoreValidator = {
    submitQuizSchema: yup.object().shape({
        userId: yup.string().required("User ID is required"),
        quizId: yup.string().required("Quiz ID is required"),
        answers: yup
            .array()
            .of(
                yup.object().shape({
                    questionId: yup.string().required("Question ID is required"),
                    userAnswer: yup
                        .array()
                        .of(yup.string())
                        .min(1, "Answer is required")
                        .required("Answer is required"),
                })
            )
            .min(1, "At least one answer required")
            .required("Answers are required"),
        timeTaken: yup.number().min(0, "Time taken must be positive").default(0),
    }),

    validateSubmitQuiz: (data) => {
        try {
            const validatedData = scoreValidator.submitQuizSchema.validateSync(data, {
                abortEarly: false,
                stripUnknown: true,
            });
            return validatedData;
        } catch (validationError) {
            const errors = validationError.inner.map((err) => ({
                field: err.path,
                message: err.message,
            }));
            const error = new Error("Validation failed");
            error.validationErrors = errors;
            error.isValidation = true;
            throw error;
        }
    },
};

module.exports = scoreValidator;