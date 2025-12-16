const { ROLE } = require("../config/enum/permissions.constants");
const User = require("../models/User");
const Course = require("../models/Course");

const userRepository = {
    findByEmail: async (email) => {
        return await User.findOne({ email: email, status: "active" }).populate("permissions", "name").exec();
    },

    findInstructor: async () => {
        return await User.find({ role: "instructor" }).populate("permissions", "name").exec();
    },

    getInstructor: async () => {
        return await User.aggregate([
            { $match: { role: "instructor" } },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "main_instructor",
                    as: "courses",
                    pipeline: [
                        { $sort: { rating: -1 } },
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
                    ],
                },
            },
            {
                $addFields: {
                    maxRating: { $ifNull: [{ $max: "$courses.rating" }, 0] },
                },
            },
            { $sort: { maxRating: -1 } },
        ]);
    },

    findByEmail_Duplicate: async (email) => {
        return await User.findOne({ email: email }).exec();
    },

    findDuplicateEmailExceptSelf: async (email, userId) => {
        return await User.findOne({
            email: email,
            _id: { $ne: userId },
        }).exec();
    },

    findById: async (id) => {
        return await User.findOne({ _id: id, status: "active" })
            .populate("permissions", "name")
            .select("-password")
            .exec();
    },
    findByIdV2: async (id) => {
        return await User.findOne({ _id: id, status: "active" }).populate("permissions", "name").exec();
    },

    findAll: async () => {
        return await User.find().select("-password").populate("permissions", "name").exec();
    },

    findForPermissionCourse: async (userId, email) => {
        return await User.findOne({
            _id: { $ne: userId },
            email: email,
            status: "active",
            role: "instructor",
        })
            .select("-password")
            .populate("permissions", "name")
            .exec();
    },

    create: async (data) => {
        return await User.create({
            username: data.username,
            email: data.email,
            password: data.password,
            role: data?.role || "learner",
            subject_instructor: data.subject_instructor || "",
            job_title: data?.job_title || null,
        });
    },

    update: async (id, update) => {
        return await User.findOneAndUpdate({ _id: id, status: "active" }, update, {
            new: true,
        })
            .select("-password")
            .populate("permissions", "name")
            .exec();
    },

    update_by_email: async (email, update) => {
        return await User.findOneAndUpdate({ email: email, status: "active" }, update, { new: true })
            .select("-password")
            .exec();
    },

    close: async (id) => {
        return await User.findOneAndUpdate(
            { _id: id, status: "active" },
            { status: "inactive" },
            { new: true }
        )
            .select("-password")
            .exec();
    },

    banned: async (id) => {
        return await User.findOneAndUpdate({ _id: id, status: "active" }, { status: "banned" }, { new: true })
            .select("-password")
            .exec();
    },

    save: async (user) => {
        return await user.save();
    },

    // return top instructors aggregated by their main_instructor courses (enrollments & rating)
    findTopInstructors: async (limit = 4) => {
        const pipeline = [
            { $match: { isDeleted: false, isPublished: true, status: "approve" } },
            {
                $group: {
                    _id: "$main_instructor",
                    totalEnrollments: { $sum: "$totalEnrollments" },
                    avgRating: { $avg: "$rating" },
                    coursesCount: { $sum: 1 },
                },
            },
            { $sort: { totalEnrollments: -1, avgRating: -1 } },
            { $limit: Number(limit) },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "instructor",
                },
            },
            { $unwind: "$instructor" },
            {
                $project: {
                    _id: "$instructor._id",
                    username: "$instructor.username",
                    email: "$instructor.email",
                    avatar: "$instructor.avatar",
                    role: "$instructor.role",
                    job_title: "$instructor.job_title",
                    totalEnrollments: 1,
                    avgRating: 1,
                    coursesCount: 1,
                },
            },
        ];

        return await Course.aggregate(pipeline).exec();
    },
};

module.exports = { userRepository };
