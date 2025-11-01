const yup = require("yup");
const mongoose = require("mongoose");
const { course_enum } = require("../config/enum/course.constants");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const courseValidator = {
    createCourseSchema: yup.object({
        title: yup
            .string()
            .trim()
            .min(3, course_enum.COURSE_MESSAGE.MIN_TITLE)
            .required(course_enum.COURSE_MESSAGE.REQUIRED_TITLE),

        description: yup.string().nullable(),

        main_instructor: yup
            .string()
            .required(course_enum.COURSE_MESSAGE.REQUIRED_MAIN_INSTRUCTOR)
            .test("is-objectid", course_enum.COURSE_MESSAGE.INVALID_OBJECT_ID, (v) => isObjectId(v)),

        instructors: yup
            .array()
            .of(
                yup.object({
                    id: yup
                        .string()
                        .test("is-objectid", course_enum.COURSE_MESSAGE.INVALID_OBJECT_ID, (v) => !v || isObjectId(v)),
                    permission: yup
                        .array()
                        .of(
                            yup
                                .string()
                                .test(
                                    "is-objectid",
                                    course_enum.COURSE_MESSAGE.INVALID_OBJECT_ID,
                                    (v) => !v || isObjectId(v)
                                )
                        )
                        .default([]),
                })
            )
            .default([]),

        category: yup.string().nullable(),

        thumbnail: yup.string().nullable(),

        price: yup.number().min(0, course_enum.COURSE_MESSAGE.INVALID_PRICE).default(0),

        rating: yup
            .number()
            .min(0, course_enum.COURSE_MESSAGE.INVALID_RATING)
            .max(5, course_enum.COURSE_MESSAGE.INVALID_RATING)
            .default(0),

        duration: yup.object({
            value: yup.number().min(0, course_enum.COURSE_MESSAGE.INVALID_DURATION).default(0),
            unit: yup
                .string()
                .oneOf(course_enum.VALIDATE_SCHEMA.DURATION_UNIT, course_enum.COURSE_MESSAGE.INVALID_DURATION_UNIT)
                .default("day"),
        }),

        isPublished: yup.boolean().default(false),

        totalEnrollments: yup.number().min(0, course_enum.COURSE_MESSAGE.INVALID_TOTAL_ENROLLMENT).default(0),

        status: yup
            .string()
            .oneOf(course_enum.VALIDATE_SCHEMA.STATUS, course_enum.COURSE_MESSAGE.INVALID_STATUS)
            .default("pending"),

        isDeleted: yup.boolean().default(false),
    }),

    updateCourseSchema: yup.object({
        title: yup.string().trim().min(3, course_enum.COURSE_MESSAGE.MIN_TITLE),
        description: yup.string().nullable(),
        main_instructor: yup
            .string()
            .nullable()
            .test("is-objectid", course_enum.COURSE_MESSAGE.INVALID_OBJECT_ID, (v) => !v || isObjectId(v)),
        category: yup
            .string()
            .nullable()
            .test("is-objectid", course_enum.COURSE_MESSAGE.INVALID_OBJECT_ID, (v) => !v || isObjectId(v)),
        price: yup.number().min(0, course_enum.COURSE_MESSAGE.INVALID_PRICE),
        rating: yup.number().min(0).max(5, course_enum.COURSE_MESSAGE.INVALID_RATING),
        status: yup
            .string()
            .oneOf(course_enum.VALIDATE_SCHEMA.STATUS, course_enum.COURSE_MESSAGE.INVALID_STATUS)
            .nullable(),
        isPublished: yup.boolean(),
        thumbnail: yup.string().nullable(),
    }),
};

module.exports = {
    courseValidator,
};
