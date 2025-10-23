const express = require('express');
const userReviewController = require('../controllers/user/review.controller.js');
const commonReviewController = require('../controllers/common/review.controller.js');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionMiddleware');

const reviewRouter = express.Router();

// User routes
reviewRouter.post('/:courseId', verifyToken, checkPermission(['user'], ['manage_reviews']), userReviewController.createReview);
reviewRouter.put('/:reviewId', verifyToken, checkPermission(['user'], ['manage_reviews']), userReviewController.updateReview);
reviewRouter.delete('/:reviewId', verifyToken, checkPermission(['user'], ['manage_reviews']), userReviewController.deleteReview);

// Public routes
reviewRouter.get('/course/:courseId', commonReviewController.getReviewsByCourse);

module.exports = reviewRouter;