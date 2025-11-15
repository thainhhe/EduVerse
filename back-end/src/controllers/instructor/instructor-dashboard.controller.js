const mongoose = require("mongoose");
const Course = require("../../models/Course");
const Enrollment = require("../../models/Enrollment");
const Material = require("../../models/Material");
const Category = require("../../models/Category");

const instructor_dashboard = {
  getDashboardAnalytics: async (req, res) => {
    try {
      const instructorId = req.params.id;
      if (!instructorId)
        return res
          .status(400)
          .json({ success: false, message: "Thiếu instructorId" });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // --- Tổng video upload của instructor ---
      const courseIds = await Course.find({
        main_instructor: instructorId,
      }).distinct("_id");

      const totalVideos = await Material.countDocuments({
        type: "video",
        courseId: { $in: courseIds },
      });

      const lastMonthVideos = await Material.countDocuments({
        type: "video",
        courseId: { $in: courseIds },
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      });

      const videoGrowth =
        lastMonthVideos === 0
          ? 0
          : ((totalVideos - lastMonthVideos) / lastMonthVideos) * 100;

      // --- Tổng học viên ghi danh vào khóa học của instructor ---
      const totalEnrollments = await Enrollment.countDocuments({
        courseId: { $in: courseIds },
      });

      const lastMonthEnrollments = await Enrollment.countDocuments({
        courseId: { $in: courseIds },
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      });

      const enrollmentGrowth =
        lastMonthEnrollments === 0
          ? 0
          : ((totalEnrollments - lastMonthEnrollments) / lastMonthEnrollments) *
            100;

      // --- Tổng doanh thu từ khóa học của instructor ---
      const revenueData = await Enrollment.aggregate([
        {
          $match: {
            courseId: {
              $in: courseIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
          },
        },
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
          $group: {
            _id: null,
            total: { $sum: "$course.price" },
          },
        },
      ]);
      const totalRevenue = revenueData[0]?.total || 0;

      const lastMonthRevenueData = await Enrollment.aggregate([
        {
          $match: {
            courseId: {
              $in: courseIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
          },
        },
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
          $group: {
            _id: null,
            total: { $sum: "$course.price" },
          },
        },
      ]);

      const lastMonthRevenue = lastMonthRevenueData[0]?.total || 0;
      const revenueGrowth =
        lastMonthRevenue === 0
          ? 100
          : ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

      // --- Điểm trung bình khóa học ---
      const avgRatingData = await Course.aggregate([
        {
          $match: {
            createdBy: new mongoose.Types.ObjectId(instructorId),
            rating: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
          },
        },
      ]);
      const avgRating = avgRatingData[0]?.avgRating?.toFixed(1) || 0;

      // --- Xu hướng ghi danh 6 tháng gần nhất ---
      const enrollmentTrends = await Enrollment.aggregate([
        {
          $match: {
            courseId: {
              $in: courseIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // --- Phân bố doanh thu theo category ---
      const revenueDistribution = await Course.aggregate([
        {
          $match: { createdBy: new mongoose.Types.ObjectId(instructorId) },
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
          $group: {
            _id: "$category",
            revenue: {
              $sum: { $multiply: ["$price", { $size: "$enrollments" }] },
            },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        {
          $project: {
            _id: 0,
            category: "$category.name",
            revenue: 1,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        data: {
          overview: {
            totalCourse: courseIds.length,
            totalVideos,
            videoGrowth: videoGrowth.toFixed(1),
            totalEnrollments,
            enrollmentGrowth: enrollmentGrowth.toFixed(1),
            totalRevenue,
            revenueGrowth: revenueGrowth.toFixed(1),
            avgRating,
          },
          enrollmentTrends,
          revenueDistribution,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = { instructor_dashboard };
