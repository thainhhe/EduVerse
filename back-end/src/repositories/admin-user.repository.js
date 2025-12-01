const mongoose = require("mongoose");
const User = require("../models/User");

const adminUserRepository = {
    findByIdWithDetails: async (id) => {
        try {
            const result = await User.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
                        from: "enrollments",
                        localField: "_id",
                        foreignField: "userId",
                        as: "enrolledCourses",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "courses",
                                    localField: "courseId",
                                    foreignField: "_id",
                                    as: "course",
                                    pipeline: [
                                        {
                                            $lookup: {
                                                from: "categories",
                                                localField: "category",
                                                foreignField: "_id",
                                                as: "category",
                                            },
                                        },
                                        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
                                        {
                                            $lookup: {
                                                from: "users",
                                                localField: "main_instructor",
                                                foreignField: "_id",
                                                as: "main_instructor",
                                                pipeline: [
                                                    { $project: { username: 1, email: 1, avatar: 1 } },
                                                ],
                                            },
                                        },
                                        {
                                            $unwind: {
                                                path: "$main_instructor",
                                                preserveNullAndEmptyArrays: true,
                                            },
                                        },
                                    ],
                                },
                            },
                            { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
                            {
                                $project: {
                                    _id: 1,
                                    course: 1,
                                    enrollmentDate: 1,
                                    progress: 1,
                                    status: 1,
                                },
                            },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: "courses",
                        localField: "_id",
                        foreignField: "main_instructor",
                        as: "createdCourses",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "categories",
                                    localField: "category",
                                    foreignField: "_id",
                                    as: "category",
                                },
                            },
                            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
                            {
                                $project: {
                                    _id: 1,
                                    title: 1,
                                    thumbnail: 1,
                                    category: 1,
                                    status: 1,
                                    price: 1,
                                    rating: 1,
                                    totalEnrollments: 1,
                                    createdAt: 1,
                                    updatedAt: 1,
                                },
                            },
                        ],
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
            ]);

            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new Error(error);
        }
    },
};

module.exports = { adminUserRepository };
