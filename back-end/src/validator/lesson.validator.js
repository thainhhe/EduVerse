const yup = require("yup");
const mongoose = require("mongoose");
const { lesson_enum } = require("../config/enum/lesson.constants");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const lessonValidator = {
    lesson: yup.object({
        moduleId: yup
            .string()
            .required(lesson_enum.LESSON_MESSAGE.INVALID_OBJECT_ID)
            .test("is-objectid", lesson_enum.LESSON_MESSAGE.INVALID_OBJECT_ID, (value) => isObjectId(value)),

        title: yup
            .string()
            .required(lesson_enum.LESSON_MESSAGE.REQUIRED_TITLE)
            .min(3, lesson_enum.LESSON_MESSAGE.MIN_TITLE)
            .max(200, lesson_enum.LESSON_MESSAGE.MAX_TITLE),

        content: yup.string().nullable(),

        type: yup
            .string()
            .oneOf(lesson_enum.VALIDATE_SCHEMA.TYPE, lesson_enum.LESSON_MESSAGE.INVALID_TYPE)
            .default("article"),
        order: yup
            .number()
            .required(lesson_enum.LESSON_MESSAGE.REQUIRED_ORDER)
            .integer(lesson_enum.LESSON_MESSAGE.ORDER_INVALID),
        user_completed: yup
            .array()
            .of(
                yup
                    .string()
                    .test("is-objectid", lesson_enum.LESSON_MESSAGE.INVALID_OBJECT_ID, (v) => !v || isObjectId(v))
            )
            .default([]),
        materials: yup
            .array()
            .of(
                yup
                    .string()
                    .test("is-objectid", lesson_enum.LESSON_MESSAGE.INVALID_OBJECT_ID, (v) => !v || isObjectId(v))
            )
            .default([]),
        quiz: yup
            .string()
            .nullable()
            .test("is-objectid", lesson_enum.LESSON_MESSAGE.INVALID_OBJECT_ID, (v) => !v || isObjectId(v)),
        status: yup
            .string()
            .oneOf(lesson_enum.VALIDATE_SCHEMA.STATUS, lesson_enum.LESSON_MESSAGE.INVALID_STATUS)
            .default("hidden"),
        resources: yup.array().of(yup.string()).default([]),
    }),
};

module.exports = {
    lessonValidator,
};
