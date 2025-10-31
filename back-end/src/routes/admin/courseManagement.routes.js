const express = require('express');
const { adminCourseManagementController } = require("../../controllers/admin/courseManagement.controller");
const courseManagementRouter = express.Router();

courseManagementRouter.get('/courses', adminCourseManagementController.getAllCourses);

module.exports = courseManagementRouter;