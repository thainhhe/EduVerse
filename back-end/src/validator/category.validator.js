const yup = require("yup");

const categoryValidator = {
    createCategorySchema: yup.object().shape({
        name: yup
            .string()
            .required("Category name is required.")
            .min(3, "Category name must be at least 3 characters long.")
            .max(50, "Category name cannot exceed 50 characters."),
        description: yup
            .string()
            .required("Category description is required.")
            .max(200, "Category description cannot exceed 200 characters."),
    }),

    updateCategorySchema: yup.object().shape({
        name: yup
            .string()
            .min(3, "Category name must be at least 3 characters long.")
            .max(50, "Category name cannot exceed 50 characters.")
            .notRequired(),
        description: yup
            .string()
            .required("Category description is required.")
            .max(200, "Category description cannot exceed 200 characters."),
    }),

    validateCategoryData: (data, isUpdate = false) => {
        const schema = isUpdate
            ? categoryValidator.updateCategorySchema
            : categoryValidator.createCategorySchema;
        try {
            // Validate và lấy dữ liệu đã cast
            const validatedData = schema.validateSync(data, { abortEarly: false });
            return { valid: true, data: validatedData };
        } catch (validationError) {
            // Gom tất cả message lỗi
            const errors = validationError.inner.map(err => ({
                field: err.path,
                message: err.message
            }));
            return { valid: false, errors };
        }
    }
};

module.exports = { categoryValidator };