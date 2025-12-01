const express = require("express");
const { dashboardController } = require("../../controllers/admin/dashboard.controller");
const dashboardRoutes = express.Router();

dashboardRoutes.get("/total-users", dashboardController.getTotalUsers);
dashboardRoutes.get("/total-instructors", dashboardController.getTotalInstructors);
dashboardRoutes.get("/total-learners", dashboardController.getTotalLearners);
dashboardRoutes.get("/total-courses", dashboardController.getTotalCourses);
dashboardRoutes.get("/total-approved-courses", dashboardController.getTotalApprovedCourses);
dashboardRoutes.get("/total-pending-courses", dashboardController.getTotalPendingCourses);
dashboardRoutes.get("/total-pending-reports", dashboardController.getTotalPendingReports);
dashboardRoutes.get("/monthly-user-statistics/:year", dashboardController.getMonthlyUserStatistics);
dashboardRoutes.get(
    "/monthly-enrollment-statistics/:year",
    dashboardController.getMonthlyEnrollmentStatistics
);
dashboardRoutes.get("/total-revenue", dashboardController.getTotalRevenue);
dashboardRoutes.get("/monthly-revenue-statistics/:year", dashboardController.getMonthlyRevenueStatistics);
dashboardRoutes.get("/total-enrollments", dashboardController.getTotalEnrollments);
dashboardRoutes.get("/top-popular-courses", dashboardController.getTopPopularCourses);
dashboardRoutes.get("/top-learners", dashboardController.getTopLearners);
dashboardRoutes.get("/top-revenue-courses", dashboardController.getTopRevenueCourses);
dashboardRoutes.get("/top-revenue-instructors", dashboardController.getTopRevenueInstructors);
dashboardRoutes.get("/instructor-revenue-list", dashboardController.getInstructorRevenueList);
dashboardRoutes.get(
    "/instructor-course-revenue/:instructorId",
    dashboardController.getInstructorCourseRevenue
);

module.exports = dashboardRoutes;
