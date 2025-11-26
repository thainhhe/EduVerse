const User = require("../../models/User");
const Course = require("../../models/Course");
const IssueReport = require("../../models/IssueReport");
const Review = require("../../models/Review");
const Enrollment = require("../../models/Enrollment");
const Category = require("../../models/Category");
const Payment = require("../../models/Payment");

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
      throw new Error(
        "Error fetching total approved courses: " + error.message
      );
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
      throw new Error(
        "Error fetching monthly user statistics: " + error.message
      );
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
            status: "completed",
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
      throw new Error(
        "Error fetching monthly revenue statistics: " + error.message
      );
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
          $project: {
            _id: 0,
            courseId: "$courseDetails._id",
            courseTitle: "$courseDetails.title",
            mainInstructor: "$instructorDetails.name",
            category: "$categoryDetails.name",
            enrollmentCount: 1,
            averageRating: "$courseDetails.rating",
          },
        }
      );

      const popularCourses = await Enrollment.aggregate(pipeline);
      return popularCourses;
    } catch (error) {
      throw new Error("Error fetching top popular courses: " + error.message);
    }
  },
};

module.exports = DashboardRepository;
