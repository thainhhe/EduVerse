const Course = require("../models/Course");
const User = require("../models/User");

const courseRepository = {
    getAll: async () => {
        return await Course.find()
            .sort({ createdAt: -1 })
            .populate("category")
            .populate("main_instructor", "_id username email")
            .populate("instructors.id", "_id username email permission")
            .populate("instructors.permission")
            .exec();
    },

    getInstructor_sort_by_rating: async () => {
        return await User.aggregate([
            {
                $match: { role: "instructor", isDeleted: false },
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "main_instructor",
                    as: "courses",
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "courses.category",
                    foreignField: "_id",
                    as: "categoryInfo",
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
                    _id: 0,
                    instructorId: "$_id",
                    name: 1,
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
        return await Course.find({ isPublished: true, status: "approve", isDeleted: false })
            .sort({ createdAt: -1 })
            .populate("category")
            .populate("main_instructor", "_id username email")
            .populate("instructors.id", "_id username email")
            .populate("instructors.permission")
            .exec();
    },

    getAllByMainInstructor: async (id) => {
        return await Course.find({ main_instructor: id, isDeleted: false })
            .sort({ createdAt: -1 })
            .populate("category")
            .populate("main_instructor", "_id username email")
            .populate("instructors.id", "_id username email")
            .populate("instructors.permission")
            .exec();
    },

    getById: async (id) => {
        return await Course.findById({ _id: id, isDeleted: false })
            .populate("category")
            .populate("main_instructor")
            .populate("instructors.id")
            .populate("instructors.permission")
            .exec();
    },

    create: async (data) => {
        const course = new Course(data);
        return await course.save();
    },

    update: async (id, data) => {
        return await Course.findByIdAndUpdate(id, data, { new: true }).exec();
    },

    delete: async (id) => {
        return await Course.findByIdAndUpdate(id, { isDeleted: true }).exec();
    },

    save: async (data) => {
        return data.save();
    },
};

module.exports = courseRepository;
