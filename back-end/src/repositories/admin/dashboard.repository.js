const User = require("../../models/User");
const Course = require("../../models/Course");
const IssueReport = require("../../models/IssueReport");
const Review = require("../../models/Review");
const Enrollment = require("../../models/Enrollment");
const Category = require("../../models/Category");
const Payment = require("../../models/Payment");
const mongoose = require("mongoose");

const DashboardRepository = {
    getTotalUsers: async ({ startDate, endDate } = {}) => {
        try {
            const query = {};
            if (startDate && endDate) {
                query.createdAt = { $gte: startDate, $lte: endDate };
            }
            const totalUsers = await User.countDocuments(query);
            return totalUsers;
        } catch (error) {
            throw new Error("Error fetching total users: " + error.message);
        }
    },

    getTotalInstructors: async ({ startDate, endDate } = {}) => {
        try {
            const query = { role: "instructor" };
            if (startDate && endDate) {
                query.createdAt = { $gte: startDate, $lte: endDate };
            }
            const totalInstructors = await User.countDocuments(query);
            return totalInstructors;
        } catch (error) {
            throw new Error("Error fetching total instructors: " + error.message);
        }
    },

    getTotalLearners: async ({ startDate, endDate } = {}) => {
        try {
            const query = { role: "learner" };
            if (startDate && endDate) {
                query.createdAt = { $gte: startDate, $lte: endDate };
            }
            const totalLearners = await User.countDocuments(query);
            return totalLearners;
        } catch (error) {
            throw new Error("Error fetching total learners: " + error.message);
        }
    },

    getTotalCourses: async ({ startDate, endDate } = {}) => {
        try {
            const query = {};
            if (startDate && endDate) {
                query.createdAt = { $gte: startDate, $lte: endDate };
            }
            const totalCourses = await Course.countDocuments(query);
            return totalCourses;
        } catch (error) {
            throw new Error("Error fetching total courses: " + error.message);
        }
    },

    getTotalApprovedCourses: async ({ startDate, endDate } = {}) => {
        try {
            const query = { status: "approve" };
            if (startDate && endDate) {
                query.createdAt = { $gte: startDate, $lte: endDate };
            }
            const totalApprovedCourses = await Course.countDocuments(query);
            return totalApprovedCourses;
        } catch (error) {
            throw new Error("Error fetching total approved courses: " + error.message);
        }
    },

    getTotalPendingCourses: async ({ startDate, endDate } = {}) => {
        try {
            const query = { status: "pending" };
            if (startDate && endDate) {
                query.createdAt = { $gte: startDate, $lte: endDate };
            }
            const totalPendingCourses = await Course.countDocuments(query);
            return totalPendingCourses;
        } catch (error) {
            throw new Error("Error fetching total pending courses: " + error.message);
        }
    },

    getTotalPendingReports: async ({ startDate, endDate } = {}) => {
        try {
            const query = { status: "open" };
            if (startDate && endDate) {
                query.createdAt = { $gte: startDate, $lte: endDate };
            }
            const totalPendingReports = await IssueReport.countDocuments(query);
            return totalPendingReports;
        } catch (error) {
            throw new Error("Error fetching total pending reports: " + error.message);
        }
    },

    getTotalEnrollments: async ({ startDate, endDate } = {}) => {
        try {
            const query = {};
            if (startDate && endDate) {
                query.createdAt = { $gte: startDate, $lte: endDate };
            }
            const totalEnrollments = await Enrollment.countDocuments(query);
            return totalEnrollments;
        } catch (error) {
            throw new Error("Error fetching total enrollments: " + error.message);
        }
    },

    //list 12 months statistics of user registrations for a given year
    getMonthlyUserStatistics: async (year) => {
        try {
            const stats = await User.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(`${year}-01-01`),
                            $lt: new Date(`${year + 1}-01-01`),
                        },
                    },
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        month: "$_id",
                        count: 1,
                        _id: 0,
                    },
                },
                {
                    $sort: { month: 1 },
                },
            ]);
            return stats;
        } catch (error) {
            throw new Error("Error fetching monthly user statistics: " + error.message);
        }
    },

    getMonthlyEnrollmentStatistics: async (year) => {
        try {
            const stats = await Enrollment.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(`${year}-01-01`),
                            $lt: new Date(`${year + 1}-01-01`),
                        },
                    },
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        month: "$_id",
                        count: 1,
                        _id: 0,
                    },
                },
                {
                    $sort: { month: 1 },
                },
            ]);
            return stats;
        } catch (error) {
            throw new Error("Error fetching monthly enrollment statistics: " + error.message);
        }
    },

    getTotalRevenue: async ({ startDate, endDate } = {}) => {
        try {
            const query = { status: "paid" };
            if (startDate && endDate) {
                query.paymentDate = { $gte: startDate, $lte: endDate };
            }
            const result = await Payment.aggregate([
                { $match: query },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]);
            return result.length > 0 ? result[0].total : 0;
        } catch (error) {
            throw new Error("Error fetching total revenue: " + error.message);
        }
    },

    getMonthlyRevenueStatistics: async (year) => {
        try {
            const stats = await Payment.aggregate([
                {
                    $match: {
                        paymentDate: {
                            $gte: new Date(`${year}-01-01`),
                            $lt: new Date(`${year + 1}-01-01`),
                        },
                        status: "paid",
                    },
                },
                {
                    $group: {
                        _id: { $month: "$paymentDate" },
                        total: { $sum: "$amount" }, // project as 'total' to match frontend expectation
                    },
                },
                {
                    $project: {
                        month: "$_id",
                        total: 1,
                        _id: 0,
                    },
                },
                {
                    $sort: { month: 1 },
                },
            ]);
            return stats;
        } catch (error) {
            throw new Error("Error fetching monthly revenue statistics: " + error.message);
        }
    },

    // get top popular courses based on enrollment count (list top10 with course name, main Instructor name, category, enrollment count, average rating)
    getTopPopularCourses: async ({ startDate, endDate } = {}) => {
        try {
            const pipeline = [];

            // optional date filter on enrollments
            if (startDate && endDate) {
                pipeline.push({
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                    },
                });
            }

            pipeline.push(
                {
                    $group: {
                        _id: "$courseId",
                        enrollmentCount: { $sum: 1 },
                    },
                },
                {
                    $sort: { enrollmentCount: -1 },
                },
                {
                    $limit: 10,
                },
                {
                    $lookup: {
                        from: "courses",
                        localField: "_id",
                        foreignField: "_id",
                        as: "courseDetails",
                    },
                },
                {
                    $unwind: "$courseDetails",
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "courseDetails.main_instructor",
                        foreignField: "_id",
                        as: "instructorDetails",
                    },
                },
                {
                    $unwind: "$instructorDetails",
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "courseDetails.category",
                        foreignField: "_id",
                        as: "categoryDetails",
                    },
                },
                {
                    $unwind: "$categoryDetails",
                },
                {
                    $lookup: {
                        from: "reviews",
                        localField: "courseDetails._id",
                        foreignField: "courseId",
                        as: "reviews",
                    },
                },
                {
                    $addFields: {
                        avgRatingCourse: { $ifNull: [{ $avg: "$reviews.rating" }, 0] },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        courseId: "$courseDetails._id",
                        courseTitle: "$courseDetails.title",
                        mainInstructor: "$instructorDetails.name",
                        category: "$categoryDetails.name",
                        enrollmentCount: 1,
                        averageRating: "$avgRatingCourse",
                        avgRatingCourse: 1,
                    },
                }
            );

            const popularCourses = await Enrollment.aggregate(pipeline);
            return popularCourses;
        } catch (error) {
            throw new Error("Error fetching top popular courses: " + error.message);
        }
    },

    getTopLearners: async ({ startDate, endDate } = {}) => {
        try {
            const pipeline = [];

            if (startDate && endDate) {
                pipeline.push({
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                    },
                });
            }

            pipeline.push(
                {
                    $group: {
                        _id: "$userId",
                        enrollmentCount: { $sum: 1 },
                    },
                },
                {
                    $sort: { enrollmentCount: -1 },
                },
                {
                    $limit: 10,
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "userDetails",
                    },
                },
                {
                    $unwind: "$userDetails",
                },
                {
                    $project: {
                        _id: 0,
                        userId: "$userDetails._id",
                        name: "$userDetails.name",
                        email: "$userDetails.email",
                        avatar: "$userDetails.avatar",
                        enrollmentCount: 1,
                    },
                }
            );

            const topLearners = await Enrollment.aggregate(pipeline);
            return topLearners;
        } catch (error) {
            throw new Error("Error fetching top learners: " + error.message);
        }
    },

    getTopRevenueCourses: async ({ startDate, endDate } = {}) => {
        try {
            const pipeline = [{ $match: { status: "paid" } }];

            if (startDate && endDate) {
                pipeline[0].$match.paymentDate = { $gte: startDate, $lte: endDate };
            }

            pipeline.push(
                {
                    $group: {
                        _id: "$courseId",
                        totalRevenue: { $sum: "$amount" },
                    },
                },
                {
                    $sort: { totalRevenue: -1 },
                },
                {
                    $limit: 10,
                },
                {
                    $lookup: {
                        from: "courses",
                        localField: "_id",
                        foreignField: "_id",
                        as: "courseDetails",
                    },
                },
                {
                    $unwind: "$courseDetails",
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "courseDetails.main_instructor",
                        foreignField: "_id",
                        as: "instructorDetails",
                    },
                },
                {
                    $unwind: "$instructorDetails",
                },
                {
                    $project: {
                        _id: 0,
                        courseId: "$courseDetails._id",
                        courseTitle: "$courseDetails.title",
                        mainInstructor: "$instructorDetails.name",
                        totalRevenue: 1,
                    },
                }
            );

            const topCourses = await Payment.aggregate(pipeline);
            return topCourses;
        } catch (error) {
            throw new Error("Error fetching top revenue courses: " + error.message);
        }
    },

    getTopRevenueInstructors: async ({ startDate, endDate } = {}) => {
        try {
            const pipeline = [{ $match: { status: "paid" } }];

            if (startDate && endDate) {
                pipeline[0].$match.paymentDate = { $gte: startDate, $lte: endDate };
            }

            pipeline.push(
                {
                    $lookup: {
                        from: "courses",
                        localField: "courseId",
                        foreignField: "_id",
                        as: "course",
                    },
                },
                {
                    $unwind: "$course",
                },
                {
                    $group: {
                        _id: "$course.main_instructor",
                        totalRevenue: { $sum: "$amount" },
                    },
                },
                {
                    $sort: { totalRevenue: -1 },
                },
                {
                    $limit: 10,
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "instructorDetails",
                    },
                },
                {
                    $unwind: "$instructorDetails",
                },
                {
                    $project: {
                        _id: 0,
                        instructorId: "$instructorDetails._id",
                        name: "$instructorDetails.name",
                        email: "$instructorDetails.email",
                        avatar: "$instructorDetails.avatar",
                        totalRevenue: 1,
                    },
                }
            );

            const topInstructors = await Payment.aggregate(pipeline);
            return topInstructors;
        } catch (error) {
            throw new Error("Error fetching top revenue instructors: " + error.message);
        }
    },

    getInstructorRevenueList: async ({ startDate, endDate, search, page = 1, limit = 10 } = {}) => {
        try {
            const pipeline = [{ $match: { status: "paid" } }];

            if (startDate && endDate) {
                pipeline[0].$match.paymentDate = { $gte: startDate, $lte: endDate };
            }

            pipeline.push(
                {
                    $lookup: {
                        from: "courses",
                        localField: "courseId",
                        foreignField: "_id",
                        as: "course",
                    },
                },
                {
                    $unwind: "$course",
                },
                {
                    $group: {
                        _id: "$course.main_instructor",
                        totalRevenue: { $sum: "$amount" },
                        totalSales: { $sum: 1 },
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "instructorDetails",
                    },
                },
                {
                    $unwind: "$instructorDetails",
                }
            );

            if (search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { "instructorDetails.name": { $regex: search, $options: "i" } },
                            { "instructorDetails.email": { $regex: search, $options: "i" } },
                        ],
                    },
                });
            }

            pipeline.push(
                {
                    $sort: { totalRevenue: -1 },
                },
                {
                    $project: {
                        _id: 0,
                        instructorId: "$instructorDetails._id",
                        username: "$instructorDetails.username",
                        name: "$instructorDetails.name",
                        email: "$instructorDetails.email",
                        avatar: "$instructorDetails.avatar",
                        totalRevenue: 1,
                        totalSales: 1,
                    },
                },
                {
                    $facet: {
                        metadata: [
                            { $count: "total" },
                            { $addFields: { page: parseInt(page), limit: parseInt(limit) } },
                        ],
                        data: [{ $skip: (page - 1) * limit }, { $limit: parseInt(limit) }],
                    },
                }
            );

            const result = await Payment.aggregate(pipeline);
            return {
                metadata: result[0].metadata[0] || { total: 0, page, limit },
                data: result[0].data,
            };
        } catch (error) {
            throw new Error("Error fetching instructor revenue list: " + error.message);
        }
    },

    getInstructorCourseRevenue: async ({ instructorId, startDate, endDate, page = 1, limit = 10 } = {}) => {
        try {
            const pipeline = [{ $match: { status: "paid" } }];

            if (startDate && endDate) {
                pipeline[0].$match.paymentDate = { $gte: startDate, $lte: endDate };
            }

            pipeline.push(
                {
                    $lookup: {
                        from: "courses",
                        localField: "courseId",
                        foreignField: "_id",
                        as: "course",
                    },
                },
                {
                    $unwind: "$course",
                },
                {
                    $match: {
                        "course.main_instructor": new mongoose.Types.ObjectId(instructorId),
                    },
                },
                {
                    $group: {
                        _id: "$course._id",
                        courseTitle: { $first: "$course.title" },
                        totalRevenue: { $sum: "$amount" },
                        totalLearners: { $addToSet: "$userId" }, // Count unique learners
                    },
                },
                {
                    $project: {
                        _id: 0,
                        courseId: "$_id",
                        courseTitle: 1,
                        totalRevenue: 1,
                        totalLearners: { $size: "$totalLearners" },
                    },
                },
                {
                    $sort: { totalRevenue: -1 },
                },
                {
                    $facet: {
                        metadata: [
                            { $count: "total" },
                            { $addFields: { page: parseInt(page), limit: parseInt(limit) } },
                        ],
                        data: [{ $skip: (page - 1) * limit }, { $limit: parseInt(limit) }],
                    },
                }
            );

            const result = await Payment.aggregate(pipeline);
            return {
                metadata: result[0].metadata[0] || { total: 0, page, limit },
                data: result[0].data,
            };
        } catch (error) {
            throw new Error("Error fetching instructor course revenue: " + error.message);
        }
    },
};

module.exports = DashboardRepository;
