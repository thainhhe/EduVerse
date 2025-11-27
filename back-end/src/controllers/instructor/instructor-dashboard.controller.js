const mongoose = require("mongoose");
const Course = require("../../models/Course");
const Enrollment = require("../../models/Enrollment");
const Material = require("../../models/Material");
const Category = require("../../models/Category");
const Review = require("../../models/Review");

// --- HÀM HELPER ĐỂ TÍNH PHẠM VI NGÀY DỰA TRÊN FILTER ---
const getDateRange = (filter = "month") => {
  const now = new Date();
  let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

  switch (filter) {
    case "week": // Tuần hiện tại (Giả định bắt đầu từ Chủ nhật)
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "quarter": // Quý hiện tại
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
      endDate = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0);
      break;
    case "year": // Năm hiện tại
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
    case "all": // Toàn bộ thời gian (Không giới hạn)
      startDate = new Date(0); // Epoch time
      endDate = now;
      break;
    case "month": // Tháng hiện tại (Mặc định)
    default:
      // Đã được định nghĩa ở trên (tháng hiện tại)
      break;
  }
  return { startDate, endDate };
};
// -----------------------------------------------------------------

const instructor_dashboard = {
  getDashboardAnalytics: async (req, res) => {
    try {
      const instructorId = req.params.id;
      const { filter = "month" } = req.query; // Lấy filter từ query string

      if (!instructorId)
        return res
          .status(400)
          .json({ success: false, message: "Thiếu instructorId" });

      // Phạm vi ngày dựa trên filter
      const { startDate, endDate } = getDateRange(filter);

      // Khối ngày cho tính toán Tăng trưởng (so với kỳ trước đó)
      const now = new Date();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // --- Tổng video upload của instructor ---
      const courseIds = await Course.find({
        main_instructor: instructorId,
      }).distinct("_id");

      // Dùng startDate, endDate để lọc cho các chỉ số tổng
      const totalVideos = await Material.countDocuments({
        type: "video",
        courseId: { $in: courseIds },
        createdAt: { $gte: startDate, $lte: endDate }, // Lọc theo filter
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
        createdAt: { $gte: startDate, $lte: endDate }, // Lọc theo filter
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
      const revenueMatch = {
        courseId: {
          $in: courseIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        createdAt: { $gte: startDate, $lte: endDate }, // Lọc theo filter
      };

      const revenueData = await Enrollment.aggregate([
        { $match: revenueMatch },
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

      // --- ĐÃ SỬA: Điểm trung bình khóa học (Tính từ Review Model) ---
      const avgRatingData = await Review.aggregate([
        {
          $match: {
            courseId: {
              $in: courseIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
            createdAt: { $gte: startDate, $lte: endDate }, // Lọc theo filter
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
            createdAt: { $gte: startDate, $lte: endDate }, // Lọc theo filter
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

      // --- ĐÃ SỬA: Phân bố doanh thu theo category (Sửa lọc và khớp nối) ---
      const revenueDistribution = await Course.aggregate([
        {
          $match: {
            _id: {
              $in: courseIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
          },
        },
        {
          $lookup: {
            from: "enrollments",
            let: { courseId: "$_id", coursePrice: "$price" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$courseId", "$$courseId"] },
                  createdAt: { $gte: startDate, $lte: endDate },
                },
              },
              { $group: { _id: null, enrollmentCount: { $sum: 1 } } },
            ],
            as: "enrollmentStats",
          },
        },
        {
          $unwind: {
            path: "$enrollmentStats",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            category: "$category",
            revenue: {
              $multiply: [
                "$price",
                { $ifNull: ["$enrollmentStats.enrollmentCount", 0] },
              ],
            },
          },
        },
        { $match: { revenue: { $gt: 0 } } }, // Chỉ giữ lại các course có doanh thu > 0
        {
          $group: {
            _id: "$category", // Group bằng Category ID
            revenue: { $sum: "$revenue" },
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
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            category: {
              $cond: {
                if: { $eq: ["$category.name", null] },
                then: "Uncategorized",
                else: "$category.name",
              },
            },
            revenue: 1,
          },
        },
      ]);

      // --- Hoạt động gần đây (Ghi danh và Đánh giá) ---
      const recentEnrollments = await Enrollment.find({
        courseId: { $in: courseIds },
        createdAt: { $gte: startDate, $lte: endDate }, // Lọc theo filter
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "username email avatar")
        .populate("courseId", "title")
        .lean();

      const recentReviews = await Review.find({
        courseId: { $in: courseIds },
        createdAt: { $gte: startDate, $lte: endDate }, // Lọc theo filter
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "username email avatar")
        .populate("courseId", "title")
        .lean();

      // Combine and sort activities
      const combinedActivities = [
        ...recentEnrollments.map((e) => ({
          _id: e._id,
          type: "Enrollment",
          courseTitle: e.courseId?.title || "N/A",
          user: e.userId,
          date: e.createdAt,
        })),
        ...recentReviews.map((r) => ({
          _id: r._id,
          type: "Review",
          courseTitle: r.courseId?.title || "N/A",
          user: r.userId,
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt,
        })),
      ];

      const recentActivities = combinedActivities
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 8); // Lấy 8 hoạt động gần nhất

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
          recentActivities,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = { instructor_dashboard };
