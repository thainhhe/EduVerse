const yup = require("yup");

const reviewValidator = {
    createReviewSchema: yup.object().shape({
        rating: yup
            .number()
            .required("Rating is required.")
            .min(1, "Rating must be at least 1.")
            .max(5, "Rating cannot exceed 5."),
        comment: yup
            .string()
            .max(500, "Comment cannot exceed 500 characters.")
            .notRequired(),
    }),

    editReviewSchema: yup.object().shape({
        rating: yup
            .number()
            .min(1, "Rating must be at least 1.")
            .max(5, "Rating cannot exceed 5.")
            .notRequired(),
        comment: yup
            .string()
            .max(500, "Comment cannot exceed 500 characters.")
            .notRequired(),
    }),

    validateReviewData: (data, isUpdate = false) => {
        const schema = isUpdate
            ? reviewValidator.editReviewSchema
            : reviewValidator.createReviewSchema;
        try {
            // validate và lấy dữ liệu đã cast
            const validatedData = schema.validateSync(data, { abortEarly: false });
            return validatedData;
        } catch (validationError) {
            // gom tất cả message lỗi
            const errors = validationError.inner.map(err => ({
                field: err.path,
                message: err.message
            }));
            throw new Error(JSON.stringify(errors));
        }
    }

};

module.exports = { reviewValidator };
