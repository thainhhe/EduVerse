const Yup = require("yup");

// Validator for CREATE room - requires mandatory fields
const createRoomValidator = Yup.object().shape({
    name: Yup.string()
        .trim()
        .min(3, "Room name must be at least 3 characters")
        .max(100, "Room name must not exceed 100 characters")
        .required("Please enter room name"),
    description: Yup.string().trim().max(500, "Description must not exceed 500 characters").nullable(),
    courseId: Yup.string().required("Please enter courseId"),
    createdBy: Yup.string().required("Please enter createdBy"),
    link: Yup.string().url("Link must be a valid URL").nullable(),
    password: Yup.string().max(50, "Password must not exceed 50 characters").nullable(),
    isPublic: Yup.boolean().default(false),
    startTime: Yup.date().nullable(),
    endTime: Yup.date()
        .nullable()
        .when("startTime", ([startTime], schema) => {
            if (!startTime) return schema;
            return schema.min(startTime, "End time must be after start time");
        }),
});

// Validator for UPDATE room - all fields are optional
const updateRoomValidator = Yup.object().shape({
    name: Yup.string()
        .trim()
        .min(3, "Room name must be at least 3 characters")
        .max(100, "Room name must not exceed 100 characters"),
    description: Yup.string().trim().max(500, "Description must not exceed 500 characters").nullable(),
    link: Yup.string().nullable(),
    password: Yup.string().max(50, "Password must not exceed 50 characters").nullable(),
    isPublic: Yup.boolean(),
    startTime: Yup.date().nullable(),
    endTime: Yup.date()
        .nullable()
        .when("startTime", ([startTime], schema) => {
            if (!startTime) return schema;
            return schema.min(startTime, "End time must be after start time");
        }),
    status: Yup.string().oneOf(["pending", "ongoing", "ended"], "Status must be pending, ongoing or ended"),
});

module.exports = {
    createRoomValidator,
    updateRoomValidator,
};
