const express = require('express');
const { adminCourseManagementController } = require("../../controllers/admin/courseManagement.controller");
const courseManagementRouter = express.Router();

courseManagementRouter.get('/', adminCourseManagementController.getAllCourses);
courseManagementRouter.get('/:id', adminCourseManagementController.getCourseDetailsById);

module.exports = courseManagementRouter;