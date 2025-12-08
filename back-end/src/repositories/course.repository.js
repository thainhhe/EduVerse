const mongoose = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");

const courseRepository = {
    getAll: async () => {
        return await Course.find()
            .sort({ createdAt: -1 })
            .populate("category")
            .populate("main_instructor", "_id username email")
            .populate("instructors.user", "_id username email")
            .populate("instructors.permission")
            .exec();
    },

    getInstructor_sort_by_rating: async () => {
        return await User.aggregate([
            {
                $match: { role: "instructor" },
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "main_instructor",
                    as: "courses",
                },
            },
            // {
            //     $lookup: {
            //         from: "categories",
            //         localField: "courses.category",
            //         foreignField: "_id",
            //         as: "categoryInfo",
            //     },
            // },
            {
                $lookup: {
                    from: "courses",
                    let: { instructorId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$main_instructor", "$$instructorId"] },
                                isPublished: true,
                            },
                        },
                    ],
                    as: "courses",
                },
            },
            {
                $addFields: {
                    totalCourses: { $size: "$courses" },
                    avgRating: {
                        $cond: [{ $gt: [{ $size: "$courses" }, 0] }, { $avg: "$courses.rating" }, 0],
                    },
                    maxRating: {
                        $cond: [{ $gt: [{ $size: "$courses" }, 0] }, { $max: "$courses.rating" }, 0],
                    },
                    category: {
                        $map: {
                            input: "$categoryInfo",
                            as: "cat",
                            in: "$$cat.name",
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    instructorId: "$_id",
                    username: 1,
                    avatar: 1,
                    email: 1,
                    address: 1,
                    phoneNumber: 1,
                    introduction: 1,
                    job_title: 1,
                    subject_instructor: 1,
                    totalCourses: 1,
                    avgRating: { $round: ["$avgRating", 2] },
                    maxRating: 1,
                    category: 1,
                },
            },
            {
                $sort: { avgRating: -1, totalCourses: -1 },
            },
        ]);
    },

    getAllForLearner: async () => {
        // Aggregate: lấy course + reviews (avgRating, reviewsCount) + main_instructor (select fields)
        return await Course.aggregate([
            { $match: { isPublished: true, status: "approve", isDeleted: false } },
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "courseId",
                    as: "reviews",
                },
            },
            {
                $addFields: {
                    avgRating: {
                        $cond: [
                            { $gt: [{ $size: "$reviews" }, 0] },
                            { $round: [{ $avg: "$reviews.rating" }, 2] },
                            0,
                        ],
                    },
                    reviewsCount: { $size: "$reviews" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "main_instructor",
                    foreignField: "_id",
                    as: "main_instructor",
                },
            },
            {
                $unwind: { path: "$main_instructor", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    reviews: 0,
                    __v: 0,
                    "instructors.permission": 0,
                },
            },
            { $sort: { createdAt: -1 } },
        ]).exec();
    },

    getAllByMainInstructor: async (id) => {
        const _id = new mongoose.Types.ObjectId(id);
        return await User.aggregate([
            { $match: { _id: _id, role: "instructor" } },
            {
                $lookup: {
                    from: "permissions",
                    localField: "permissions",
                    foreignField: "_id",
                    as: "permissions",
                },
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "main_instructor",
                    as: "courses",
                    pipeline: [
                        { $sort: { rating: -1 } },
                        // Lookup category
                        {
                            $lookup: {
                                from: "categories",
                                localField: "category",
                                foreignField: "_id",
                                as: "category",
                            },
                        },
                        {
                            $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
                        },
                        // Lookup main_instructor details
                        {
                            $lookup: {
                                from: "users",
                                localField: "main_instructor",
                                foreignField: "_id",
                                as: "main_instructor",
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: "permissions",
                                            localField: "permissions",
                                            foreignField: "_id",
                                            as: "permissions",
                                        },
                                    },
                                    {
                                        $project: {
                                            password: 0,
                                            resetOtpHash: 0,
                                            resetOtpExpires: 0,
                                            resetOtpAttempts: 0,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $unwind: {
                                path: "$main_instructor",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        // Lookup modules & lessons
                        {
                            $lookup: {
                                from: "modules",
                                localField: "_id",
                                foreignField: "courseId",
                                as: "modules",
                                pipeline: [
                                    { $sort: { order: 1, createdAt: 1 } },
                                    {
                                        $lookup: {
                                            from: "lessons",
                                            localField: "_id",
                                            foreignField: "moduleId",
                                            as: "lessons",
                                            pipeline: [{ $sort: { order: 1, createdAt: 1 } }],
                                        },
                                    },
                                ],
                            },
                        },
                        // Lookup instructors email
                        {
                            $lookup: {
                                from: "users",
                                localField: "instructors.user",
                                foreignField: "_id",
                                as: "instructorUsers",
                                pipeline: [{ $project: { email: 1 } }],
                            },
                        },
                        {
                            $addFields: {
                                instructors: {
                                    $map: {
                                        input: "$instructors",
                                        as: "inst",
                                        in: {
                                            isAccept: "$$inst.isAccept",
                                            permissions: "$$inst.permission", // giữ nguyên ObjectId
                                            email: {
                                                $arrayElemAt: [
                                                    {
                                                        $map: {
                                                            input: {
                                                                $filter: {
                                                                    input: "$instructorUsers",
                                                                    as: "u",
                                                                    cond: { $eq: ["$$u._id", "$$inst.user"] },
                                                                },
                                                            },
                                                            as: "u",
                                                            in: "$$u.email",
                                                        },
                                                    },
                                                    0,
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        { $unset: "instructorUsers" },
                    ],
                },
            },
            {
                $addFields: {
                    maxRating: { $ifNull: [{ $max: "$courses.rating" }, 0] },
                },
            },
            {
                $project: {
                    password: 0,
                    resetOtpHash: 0,
                    resetOtpExpires: 0,
                    resetOtpAttempts: 0,
                    __v: 0,
                },
            },
        ]);
    },
    getById: async (id) => {
        return await Course.findById({ _id: id, isDeleted: false })
            .populate("category")
            .populate("main_instructor")
            .populate("instructors.user")
            .populate("instructors.permission")
            .exec();
    },

    getCollaborativeCourse: async (userId) => {
        return await Course.find({ "instructors.user": userId, isDeleted: false })
            .populate("category")
            .populate("main_instructor")
            .populate("instructors.user")
            .populate("instructors.permission")
            .exec();
    },

    updateStatusPending: async (id) => {
        return await Course.findByIdAndUpdate(id, { status: "pending" }, { new: true }).exec();
    },

    create: async (data) => {
        const course = new Course(data);
        return await course.save();
    },

    update: async (id, data) => {
        return await Course.findByIdAndUpdate(id, data, { new: true }).exec();
    },

    delete: async (id) => {
        const course = await Course.findById(id);
        if (!course) throw new Error("Course not found");
        if (course.status === "draft") {
            return await Course.findByIdAndDelete(id);
        }
        if (course.status !== "draft") {
            course.isDeleted = true;
            return await course.save();
        }
        throw new Error("Unsupported status for delete action");
    },

    save: async (data) => {
        return data.save();
    },

    findByInstructor: async (instructorId) => {
        try {
            // Sử dụng đúng trường main_instructor và isDeleted
            const courses = await Course.find({
                main_instructor: instructorId,
                isDeleted: false,
            })
                .populate("category", "name") // Chỉ populate những trường cần thiết
                // Bỏ populate modules/lessons ở đây
                .select("-__v -isDeleted") // Loại bỏ các trường không cần thiết
                .sort({ createdAt: -1 }) // Sắp xếp nếu muốn
                .lean() // Dùng lean() để trả về plain JS objects
                .exec();
            return courses; // Trả về danh sách khóa học tìm được
        } catch (err) {
            console.error("Lỗi trong repository findByInstructor:", err);
            throw err; // Ném lỗi để service/controller xử lý
        }
    },

    getCourseByCategory: async (categoryId) => {
        try {
            const courses = await Course.find({
                category: categoryId,
                isDeleted: false,
            })
                .populate("main_instructor", "name email")
                .select("-__v -isDeleted")
                .sort({ createdAt: -1 })
                .lean()
                .exec();
            return courses;
        } catch (err) {
            console.error("Lỗi trong repository getCourseByCategory:", err);
            throw err;
        }
    },

    getPopular: async (limit = 6) => {
        // Aggregate to compute avgRating and reviewsCount, then sort and limit
        const lim = Number(limit) || 6;
        return await Course.aggregate([
            { $match: { isDeleted: false, isPublished: true, status: "approve" } },
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "courseId",
                    as: "reviews",
                },
            },
            {
                $addFields: {
                    avgRating: {
                        $cond: [
                            { $gt: [{ $size: "$reviews" }, 0] },
                            { $round: [{ $avg: "$reviews.rating" }, 2] },
                            0,
                        ],
                    },
                    reviewsCount: { $size: "$reviews" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "main_instructor",
                    foreignField: "_id",
                    as: "main_instructor",
                },
            },
            {
                $unwind: { path: "$main_instructor", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    reviews: 0,
                    __v: 0,
                },
            },
            { $sort: { totalEnrollments: -1, avgRating: -1 } },
            { $limit: lim },
        ]).exec();
    },
};

module.exports = { courseRepository };
