const express = require('express');
const { dashboardController } = require('../../controllers/admin/dashboard.controller');
const dashboardRoutes = express.Router();

dashboardRoutes.get('/total-users', dashboardController.getTotalUsers);
dashboardRoutes.get('/total-instructors', dashboardController.getTotalInstructors);
dashboardRoutes.get('/total-learners', dashboardController.getTotalLearners);
dashboardRoutes.get('/total-courses', dashboardController.getTotalCourses);
dashboardRoutes.get('/total-approved-courses', dashboardController.getTotalApprovedCourses);
dashboardRoutes.get('/total-pending-courses', dashboardController.getTotalPendingCourses);
dashboardRoutes.get('/total-pending-reports', dashboardController.getTotalPendingReports);
dashboardRoutes.get('/monthly-user-statistics/:year', dashboardController.getMonthlyUserStatistics);
dashboardRoutes.get('/monthly-revenue-statistics/:year', dashboardController.getMonthlyRevenueStatistics);
dashboardRoutes.get('/top-popular-courses', dashboardController.getTopPopularCourses);

module.exports = dashboardRoutes;