const express = require('express');
const { adminCourseManagementController } = require("../../controllers/admin/courseManagement.controller");
const courseManagementRouter = express.Router();

courseManagementRouter.get('/', adminCourseManagementController.getAllCourses);
courseManagementRouter.get('/:id', adminCourseManagementController.getCourseDetailsById);

// Approve and Reject routes
courseManagementRouter.put('/:id/approve', adminCourseManagementController.approveCourse);
courseManagementRouter.put('/:id/reject', adminCourseManagementController.rejectCourse);

module.exports = courseManagementRouter;