const express = require('express');
const enrollmentController = require('../controllers/users/enroll.controller');
const { verifyToken } = require('../middlewares/auth/authMiddleware');
const enrollRouter = express.Router();

enrollRouter.get('/', verifyToken, enrollmentController.getAllEnrollments);
enrollRouter.get('/:id', verifyToken, enrollmentController.getEnrollmentById);
enrollRouter.post('/', verifyToken, enrollmentController.createEnrollment);
enrollRouter.put('/:id', verifyToken, enrollmentController.updateEnrollment);
enrollRouter.delete('/:id', verifyToken, enrollmentController.deleteEnrollment);

module.exports = enrollRouter;
