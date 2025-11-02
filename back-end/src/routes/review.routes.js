const express = require('express');
const reviewController = require('../controllers/course/review.controller');
const { verifyToken } = require('../middlewares/auth/authMiddleware');
const reviewRouter = express.Router();

// get all reviews
reviewRouter.get('/', reviewController.getAllReviews);
// get review by id
reviewRouter.get('/:id', verifyToken, reviewController.getReviewById);
// create review
reviewRouter.post('/', verifyToken, reviewController.createReview);
// update review
reviewRouter.put('/:id', verifyToken, reviewController.updateReview);
// delete review
reviewRouter.delete('/:id', verifyToken, reviewController.deleteReview);
// get all review of course and calculator avg rating
reviewRouter.get('/course/:courseId', reviewController.getAllReviewsOfCourseAndAvgRating);
// get all review of user
reviewRouter.get('/user/:userId', reviewController.getAllReviewByUserId);

module.exports = reviewRouter;