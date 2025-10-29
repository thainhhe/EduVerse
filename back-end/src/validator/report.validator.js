const yup = require("yup");

const reportValidator = {
    createReportSchema: yup.object().shape({
        issueType: yup
            .string()
            .required("Issue type is required.")
            .oneOf(["bug", "feature", "other"], "Invalid issue type. Allowed types are: bug, feature, other."),
        description: yup
            .string()
            .required("Description is required.")
            .max(1000, "Description cannot exceed 1000 characters."),
        fileAttachment: yup
            .array()
            .of(yup.string())
            .max(5, "File attachment cannot exceed 5 files.")
            .notRequired(),
    }),

    validateReportData: (data) => {
        try {
            const validatedData = reportValidator.createReportSchema.validateSync(data, { abortEarly: false });
            return validatedData;
        } catch (validationError) {
            const errors = validationError.inner.map(err => ({
                field: err.path,
                message: err.message
            }));
            throw new Error(JSON.stringify(errors));
        }
    }

};

module.exports = { reportValidator };
