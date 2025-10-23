const yup = require("yup");

const courseValidator = {
    create: yup.object().shape({
        title: yup.string().trim().required("Title is required"),
        description: yup.string().max(2000, "Description too long"),
        main_instructor: yup.string().required("Main instructor is required"),
        category: yup.string().required("Category is required"),
        price: yup.number().min(0, "Price cannot be negative").default(0),
        duration: yup.object().shape({
            value: yup.number().min(0).required("Duration value is required"),
            unit: yup.string().oneOf(["day", "month", "year"]).default("day"),
        }),
        thumbnail: yup.string().url("Thumbnail must be a valid URL").nullable(),
    }),

    update: yup.object().shape({
        title: yup.string().trim(),
        description: yup.string().max(2000),
        price: yup.number().min(0),
        duration: yup.object().shape({
            value: yup.number().min(0),
            unit: yup.string().oneOf(["day", "month", "year"]),
        }),
        isPublished: yup.boolean(),
        status: yup.string().oneOf(["pending", "approved", "rejected"]),
    }),
};

module.exports = { courseValidator };
