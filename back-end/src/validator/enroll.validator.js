const yup = require("yup");

const enrollValidator = {
    createEnrollSchema: yup.object().shape({
        userId: yup
            .string()
            .required("User ID is required."),
        courseId: yup
            .string()
            .required("Course ID is required."),
        progress: yup
            .number()
            .min(0, "Progress cannot be less than 0%.")
            .max(100, "Progress cannot exceed 100%.")
            .default(0),
        status: yup
            .string()
            .oneOf(["enrolled", "completed", "dropped"], "Status must be one of the following: enrolled, completed, dropped.")
            .default("enrolled"),
    }),

    editEnrollSchema: yup.object().shape({
        progress: yup
            .number()
            .min(0, "Progress cannot be less than 0%.")
            .max(100, "Progress cannot exceed 100%.")
            .notRequired(),
        status: yup
            .string()
            .oneOf(["enrolled", "completed", "dropped"], "Status must be one of the following: enrolled, completed, dropped.")
            .notRequired(),
    }),

    validateEnrollData: (data, isUpdate = false) => {
        const schema = isUpdate
            ? enrollValidator.editEnrollSchema
            : enrollValidator.createEnrollSchema;
        try {
            const validatedData = schema.validateSync(data, { 
                abortEarly: false,
                stripUnknown: true 
            });
            return validatedData;
        } catch (validationError) {
            const errors = validationError.inner.map(err => ({
                field: err.path,
                message: err.message
            }));
            const error = new Error('Validation failed');
            error.validationErrors = errors;
            error.isValidation = true;
            throw error;
        }
    }
};

module.exports = enrollValidator;