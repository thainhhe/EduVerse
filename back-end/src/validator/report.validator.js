const yup = require('yup');
const mongoose = require('mongoose');

// Helper Yup để kiểm tra ObjectId
const objectIdValidator = yup.string().test(
    'is-object-id',
    '${path} must be a valid MongoDB ObjectId',
    (value) => {
        if (!value) return true; 
        return mongoose.Types.ObjectId.isValid(value);
    }
);

// Schema để tạo report
const createReportSchema = yup.object({
    userId: objectIdValidator.required("userId is required in the body"),

    scope: yup.string().oneOf(['course', 'system']).required(),
    
    courseId: yup.string().when('scope', {
        is: 'course',
        then: (schema) => schema.concat(objectIdValidator)
                                .required('courseId is required for course scope'),
        otherwise: (schema) => schema.nullable(),
    }),
    
    issueType: yup.string().oneOf(['bug', 'feature', 'other']).required(),
    description: yup.string().min(10, 'Description must be at least 10 characters').required(),
    fileAttachment: yup.array().of(yup.string().url()).optional(),
});

// Schema để cập nhật status (Dùng cho cả Admin và Instructor)
const updateStatusSchema = yup.object({
    status: yup.string().oneOf(['open', 'inprogress', 'resolved']).required(),
});

// Middleware (Không đổi)
const validate = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: error.errors,
        });
    }
};

module.exports = {
    validateCreateReport: validate(createReportSchema),
    validateUpdateStatus: validate(updateStatusSchema),
};