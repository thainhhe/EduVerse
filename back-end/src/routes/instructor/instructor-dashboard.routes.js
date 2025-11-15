const express = require("express");
const {
  instructor_dashboard,
} = require("../../controllers/instructor/instructor-dashboard.controller");

const instructor_dashboard_router = express.Router();
instructor_dashboard_router.get(
  "/stat/:id",
  instructor_dashboard.getDashboardAnalytics
);

module.exports = instructor_dashboard_router;
