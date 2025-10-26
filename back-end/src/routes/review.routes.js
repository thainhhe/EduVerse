const express = require('express');
const reviewController = require('../controllers/course/review.controller');
const { verifyToken } = require('../middlewares/auth/authMiddleware');
const reviewRouter = express.Router();

// get all reviews
reviewRouter.get('/', reviewController.getAllReviews);
// get review by id
reviewRouter.get('/:id', reviewController.getReviewById);
// create review
reviewRouter.post('/', reviewController.createReview);
// update review
reviewRouter.put('/:id', reviewController.updateReview);
// delete review
reviewRouter.delete('/:id', reviewController.deleteReview);

module.exports = reviewRouter;