const yup = require("yup");

const favoriteValidator = {
    addFavoriteSchema: yup.object().shape({
        userId: yup
            .string()
            .required("User ID is required.")
            .matches(/^[0-9a-fA-F]{24}$/, "Invalid User ID format."),
        courseId: yup
            .string()
            .required("Course ID is required.")
            .matches(/^[0-9a-fA-F]{24}$/, "Invalid Course ID format."),
    }),

    removeFavoriteSchema: yup.object().shape({
        courseId: yup
            .string()
            .required("Course ID is required.")
            .matches(/^[0-9a-fA-F]{24}$/, "Invalid Course ID format."),
    }),

    validateFavoriteData: (data, isRemove = false) => {
        const schema = isRemove
            ? favoriteValidator.removeFavoriteSchema
            : favoriteValidator.addFavoriteSchema;
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

module.exports = favoriteValidator;