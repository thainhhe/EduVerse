const User = require('../../models/User');
const Course = require('../../models/Course');
const IssueReport = require('../../models/IssueReport');
const Review = require('../../models/Review');
const Enrollment = require('../../models/Enrollment');
const Category = require('../../models/Category');
const Payment = require('../../models/Payment');

const DashboardRepository = {
    getTotalUsers: async () => {
        try {
            const totalUsers = await User.countDocuments();
            return totalUsers;
        } catch (error) {
            throw new Error('Error fetching total users: ' + error.message);
        }
    },

    getTotalInstructors: async () => {
        try {
            const totalInstructors = await User.countDocuments({ role: 'instructor' });
            return totalInstructors;
        } catch (error) {
            throw new Error('Error fetching total instructors: ' + error.message);
        }
    },

    getTotalLearners: async () => {
        try {
            const totalLearners = await User.countDocuments({ role: 'learner' });
            return totalLearners;
        } catch (error) {
            throw new Error('Error fetching total learners: ' + error.message);
        }
    },

    getTotalCourses: async () => {
        try {
            const totalCourses = await Course.countDocuments();
            return totalCourses;
        } catch (error) {
            throw new Error('Error fetching total courses: ' + error.message);
        }
    },

    getTotalApprovedCourses: async () => {
        try {
            const totalApprovedCourses = await Course.countDocuments({ status: 'approve' });
            return totalApprovedCourses;
        } catch (error) {
            throw new Error('Error fetching total approved courses: ' + error.message);
        }
    },

    getTotalPendingCourses: async () => {
        try {
            const totalPendingCourses = await Course.countDocuments({ status: 'pending' });
            return totalPendingCourses;
        } catch (error) {
            throw new Error('Error fetching total pending courses: ' + error.message);
        }
    },

    getTotalPendingReports: async () => {
        try {
            const totalPendingReports = await IssueReport.countDocuments({ status: 'open' });
            return totalPendingReports;
        } catch (error) {
            throw new Error('Error fetching total pending reports: ' + error.message);
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
                            $lt: new Date(`${year + 1}-01-01`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        month: '$_id',
                        count: 1,
                        _id: 0
                    }
                },
                {
                    $sort: { month: 1 }
                }
            ]);
            return stats;
        } catch (error) {
            throw new Error('Error fetching monthly user statistics: ' + error.message);
        }
    },

    getMonthlyRevenueStatistics: async (year) => {
        try {
            const stats = await Payment.aggregate([
                {
                    $match: {
                        paymentDate: {
                            $gte: new Date(`${year}-01-01`),
                            $lt: new Date(`${year + 1}-01-01`)
                        },
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: { $month: "$paymentDate" },
                        totalRevenue: { $sum: "$amount" }
                    }
                },
                {
                    $project: {
                        month: '$_id',
                        totalRevenue: 1,
                        _id: 0
                    }
                },
                {
                    $sort: { month: 1 }
                }
            ]);
            return stats;
        } catch (error) {
            throw new Error('Error fetching monthly revenue statistics: ' + error.message);
        }
    },

    // get top popular courses based on enrollment count (list top10 with course name, main Instructor name, category, enrollment count, average rating)
    getTopPopularCourses: async () => {
        try {
            const popularCourses = await Enrollment.aggregate([
                {
                    $group: {
                        _id: "$courseId",
                        enrollmentCount: { $sum: 1 }
                    }
                },
                {
                    $sort: { enrollmentCount: -1 }
                },
                {
                    $limit: 10
                },
                {
                    $lookup: {
                        from: "courses",
                        localField: "_id",
                        foreignField: "_id",
                        as: "courseDetails"
                    }
                },
                {
                    $unwind: "$courseDetails"
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "courseDetails.main_instructor",
                        foreignField: "_id",
                        as: "instructorDetails"
                    }
                },
                {
                    $unwind: "$instructorDetails"
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "courseDetails.category",
                        foreignField: "_id",
                        as: "categoryDetails"
                    }
                },
                {
                    $unwind: "$categoryDetails"
                },
                {
                    $project: {
                        _id: 0,
                        courseId: "$courseDetails._id",
                        courseTitle: "$courseDetails.title",
                        mainInstructor: "$instructorDetails.name",
                        category: "$categoryDetails.name",
                        enrollmentCount: 1,
                        averageRating: "$courseDetails.rating"
                    }
                }
            ]);
            return popularCourses;
        } catch (error) {
            throw new Error('Error fetching top popular courses: ' + error.message);
        }
    }

}

module.exports = DashboardRepository;