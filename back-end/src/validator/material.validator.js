const yup = require('yup');

const materialValidator = {
    createMaterialSchema: yup.object().shape({
        title: yup.string().required('Title is required'),
        description: yup.string().notRequired(),
        type: yup
            .string()
            .oneOf(['document', 'video', 'link'], 'Type must be document, video, or link')
            .required('Type is required'),
        url: yup.string().when('type', {
            is: 'link',
            then: (schema) => schema.url('Must be a valid URL').required('URL is required for link type'),
            otherwise: (schema) => schema.notRequired(),
        }),
        uploadedBy: yup.string().required('Uploaded by user ID is required'),
        accessLevel: yup
            .string()
            .oneOf(['public', 'private', 'restricted'], 'Invalid access level')
            .default('private'),
        status: yup
            .string()
            .oneOf(['active', 'inactive', 'archived'], 'Invalid status')
            .default('active'),
    }),

    updateMaterialSchema: yup.object().shape({
        title: yup.string().notRequired(),
        description: yup.string().notRequired(),
        accessLevel: yup
            .string()
            .oneOf(['public', 'private', 'restricted'], 'Invalid access level')
            .notRequired(),
        status: yup
            .string()
            .oneOf(['active', 'inactive', 'archived'], 'Invalid status')
            .notRequired(),
    }),

    validateMaterialData: (data, isUpdate = false) => {
        const schema = isUpdate
            ? materialValidator.updateMaterialSchema
            : materialValidator.createMaterialSchema;
        
        try {
            const validatedData = schema.validateSync(data, {
                abortEarly: false,
                stripUnknown: true,
            });
            return validatedData;
        } catch (validationError) {
            const errors = validationError.inner.map((err) => ({
                field: err.path,
                message: err.message,
            }));
            const error = new Error('Validation failed');
            error.validationErrors = errors;
            error.isValidation = true;
            throw error;
        }
    },
};

module.exports = materialValidator;