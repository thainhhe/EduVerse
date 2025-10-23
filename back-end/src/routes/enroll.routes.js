const express = require('express');
const enrollRouter = express.Router();
const manageEnrollController = require('../controllers/admin/manage-enroll.controller');
const instructEnrollController = require('../controllers/instructor/enroll.controller');
const userEnrollController = require('../controllers/user/enroll.controller');
const { verifyToken } = require('../middlewares/authMiddleware.js');
const { checkPermission } = require('../middlewares/permissionMiddleware.js');

// Admin routes
enrollRouter.get('/admin', verifyToken, checkPermission(['admin'], ['manage_enrollments']), manageEnrollController.getAllEnrollments);
enrollRouter.get('/admin/:enrollmentId', verifyToken, checkPermission(['admin'], ['manage_enrollments']), manageEnrollController.getEnrollmentById);

// Instructor routes
enrollRouter.get('/instructor/courses/:courseId', verifyToken, checkPermission(['instructor'], ['manage_enrollments']), instructEnrollController.getUserEnrollmentsOfCourse);
enrollRouter.delete('/instructor/:enrollmentId', verifyToken, checkPermission(['instructor'], ['manage_enrollments']), instructEnrollController.deleteEnrollment);

// User routes
enrollRouter.post('/:userId/:courseId', verifyToken, userEnrollController.enrollUser);
enrollRouter.get('/:userId', verifyToken, userEnrollController.getEnrollmentByUserId);

module.exports = enrollRouter;