const mongoose = require("mongoose");
const Course = require("../../models/Course");
const Enrollment = require("../../models/Enrollment");
const Material = require("../../models/Material");
const Review = require("../../models/Review");
const { instructorHelper } = require("../../controllers/instructor/instructor.helper");

const instructorDashboardRepository = {
    //Lấy tất cả học viên trong một khóa học (có thể lọc theo thời gian)
    getAllLeanerInCourse: async (courseId, filter = "all") => {
        const { startDate, endDate } = instructorHelper.getDateRange(filter);

        const matchStage = {
            courseId: new mongoose.Types.ObjectId(courseId),
        };
        if (startDate && endDate) {
            matchStage.createdAt = { $gte: startDate, $lte: endDate };
        }

        return await Enrollment.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 0,
                    enrollmentDate: 1,
                    status: 1,
                    progress: 1,
                    "user._id": 1,
                    "user.username": 1,
                    "user.email": 1,
                    "user.avatar": 1,
                    "user.introduction": 1,
                    "user.address": 1,
                    "user.phoneNumber": 1,
                    "user.job_title": 1,
                    "user.role": 1,
                    "user.status": 1,
                    "user.createdAt": 1,
                },
            },
        ]);
    },

    //Danh sách khóa học bán chạy theo instructor (filter thời gian)
    getCourseIsSoldByInstructor: async (instructorId, filter = "all") => {
        const { startDate, endDate } = instructorHelper.getDateRange(filter);

        const enrollmentMatch = {};
        if (startDate && endDate) {
            enrollmentMatch.createdAt = { $gte: startDate, $lte: endDate };
        }

        // Return detailed info per course: enrollments, revenue, avgRating, category
        return await Course.aggregate([
            { $match: { main_instructor: new mongoose.Types.ObjectId(instructorId) } },
            {
                $lookup: {
                    from: "enrollments",
                    let: { courseId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$courseId", "$$courseId"] }, ...enrollmentMatch } },
                        { $project: { userId: 1, enrollmentDate: 1, pricePaid: 1, status: 1 } },
                    ],
                    as: "enrollments",
                },
            },
            {
                $lookup: {
                    from: "reviews",
                    let: { courseId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } },
                        { $project: { rating: 1, comment: 1, userId: 1, createdAt: 1 } },
                    ],
                    as: "reviews",
                },
            },
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
                $addFields: {
                    enrollmentCount: { $size: "$enrollments" },
                    totalRevenue: { $sum: "$enrollments.pricePaid" },
                    avgRating: { $cond: [{ $gt: [{ $size: "$reviews" }, 0] }, { $avg: "$reviews.rating" }, null] },
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    price: 1,
                    status: 1,
                    isPublished: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    category: { _id: "$category._id", name: "$category.name" },
                    enrollmentCount: 1,
                    totalRevenue: 1,
                    avgRating: 1,
                    reviews: 1,
                    enrollments: 1,
                },
            },
            { $sort: { enrollmentCount: -1 } },
        ]);
    },

    // 🎬 3. Tổng số video của instructor
    getTotalVideosByInstructor: async (instructorId, filter = "all") => {
        const { startDate, endDate } = instructorHelper.getDateRange(filter);
        const matchStage = { type: "video" };
        if (startDate && endDate) matchStage.createdAt = { $gte: startDate, $lte: endDate };
        const result = await Material.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "lessons",
                    localField: "lessonId",
                    foreignField: "_id",
                    as: "lesson",
                },
            },
            { $unwind: "$lesson" },
            {
                $lookup: {
                    from: "modules",
                    localField: "lesson.moduleId",
                    foreignField: "_id",
                    as: "module",
                },
            },
            { $unwind: "$module" },
            {
                $lookup: {
                    from: "courses",
                    localField: "module.courseId",
                    foreignField: "_id",
                    as: "course",
                },
            },
            { $unwind: "$course" },
            {
                $match: {
                    "course.main_instructor": new mongoose.Types.ObjectId(instructorId),
                },
            },
            {
                $group: {
                    _id: null,
                    totalVideos: { $sum: 1 },
                },
            },
        ]);

        return result.length > 0 ? result[0].totalVideos : 0;
    },

    //Tổng doanh thu của instructor
    getTotalRevenueByInstructor: async (instructorId, filter = "all") => {
        const { startDate, endDate } = instructorHelper.getDateRange(filter);
        const enrollmentMatch = {};
        if (startDate && endDate) {
            enrollmentMatch.createdAt = { $gte: startDate, $lte: endDate };
        }
        const result = await Course.aggregate([
            { $match: { main_instructor: new mongoose.Types.ObjectId(instructorId) } },
            {
                $lookup: {
                    from: "enrollments",
                    let: { courseId: "$_id" },
                    pipeline: [{ $match: { $expr: { $eq: ["$courseId", "$$courseId"] }, ...enrollmentMatch } }],
                    as: "enrollments",
                },
            },
            {
                $unwind: {
                    path: "$enrollments",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$enrollments.pricePaid" },
                },
            },
        ]);
        return result.length > 0 ? result[0].totalRevenue : 0;
    },

    //Điểm trung bình đánh giá khóa học
    getAvgCourseRatingByInstructor: async (instructorId, filter = "all") => {
        const { startDate, endDate } = instructorHelper.getDateRange(filter);
        const reviewMatch = {};
        if (startDate && endDate) {
            reviewMatch.createdAt = { $gte: startDate, $lte: endDate };
        }

        const result = await Course.aggregate([
            { $match: { main_instructor: new mongoose.Types.ObjectId(instructorId) } },
            {
                $lookup: {
                    from: "reviews",
                    let: { courseId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$courseId", "$$courseId"] },
                                ...reviewMatch,
                            },
                        },
                    ],
                    as: "reviews",
                },
            },
            {
                $lookup: {
                    from: "enrollments",
                    localField: "_id",
                    foreignField: "courseId",
                    as: "enrollments",
                },
            },
            {
                $match: { "enrollments.0": { $exists: true } },
            },
            {
                $addFields: {
                    avgRatingPerCourse: { $avg: "$reviews.rating" },
                    totalReviews: { $size: "$reviews" },
                    totalEnrollments: { $size: "$enrollments" },
                },
            },
            {
                $group: {
                    _id: null,
                    courses: {
                        $push: {
                            courseId: "$_id",
                            title: "$title",
                            avgRating: "$avgRatingPerCourse",
                            totalReviews: "$totalReviews",
                            totalEnrollments: "$totalEnrollments",
                        },
                    },
                    overallAvgRating: { $avg: "$avgRatingPerCourse" },
                },
            },
        ]);
        if (result.length === 0) {
            return {
                overallAvgRating: 0,
                courses: [],
            };
        }
        return {
            overallAvgRating: result[0].overallAvgRating || 0,
            courses: result[0].courses,
        };
    },

    // Xu hướng đăng ký theo thời gian của instructor
    getEnrollmentTrendByInstructor: async (instructorId, filter = "month") => {
        const { startDate, endDate } = instructorHelper.getDateRange(filter);
        const dateMatch = {};
        if (startDate && endDate) {
            dateMatch.enrollmentDate = { $gte: startDate, $lte: endDate };
        }
        const dateFormat =
            filter === "day"
                ? { $dateToString: { format: "%Y-%m-%d", date: "$enrollmentDate" } }
                : { $dateToString: { format: "%Y-%m", date: "$enrollmentDate" } };

        const result = await Enrollment.aggregate([
            { $match: dateMatch },
            {
                $lookup: {
                    from: "courses",
                    localField: "courseId",
                    foreignField: "_id",
                    as: "course",
                },
            },
            { $unwind: "$course" },
            {
                $match: {
                    "course.main_instructor": new mongoose.Types.ObjectId(instructorId),
                },
            },
            {
                $group: {
                    _id: dateFormat,
                    totalEnrollments: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        return result.map((item) => ({
            period: item._id,
            totalEnrollments: item.totalEnrollments,
        }));
    },

    getTopLearners: async (limit = 10, filter = "all") => {
        const { startDate, endDate } = instructorHelper.getDateRange(filter);
        const matchStage = { status: "completed" };
        if (startDate && endDate) matchStage.completionDate = { $gte: startDate, $lte: endDate };
        const result = await Enrollment.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$userId",
                    completedCourses: { $sum: 1 },
                    avgCompletionTime: { $avg: { $subtract: ["$completionDate", "$enrollmentDate"] } },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 0,
                    learnerId: "$user._id",
                    username: "$user.username",
                    email: "$user.email",
                    avatar: "$user.avatar",
                    completedCourses: 1,
                    avgCompletionDays: { $divide: ["$avgCompletionTime", 1000 * 60 * 60 * 24] },
                },
            },
            { $sort: { completedCourses: -1, avgCompletionDays: 1 } },
            { $limit: limit },
        ]);
        return result;
    },

    /**
     * Completion rate: tỉ lệ học viên hoàn thành
     */
    getCompletionRate: async (filter = "all") => {
        const { startDate, endDate } = instructorHelper.getDateRange(filter);

        const matchStage = {};
        if (startDate && endDate) matchStage.enrollmentDate = { $gte: startDate, $lte: endDate };

        const result = await Enrollment.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalEnrollments: { $sum: 1 },
                    completedEnrollments: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    completionRate: {
                        $cond: [
                            { $eq: ["$totalEnrollments", 0] },
                            0,
                            { $multiply: [{ $divide: ["$completedEnrollments", "$totalEnrollments"] }, 100] },
                        ],
                    },
                },
            },
        ]);

        return result[0]?.completionRate || 0;
    },
};

module.exports = { instructorDashboardRepository };
