const Review = require("../models/Review");

const reviewRepository = {
    getAllReviews: async () => {
        return await Review.find()
        .populate('userId')
        .populate('courseId')
        .exec();
    },

    getReviewById: async (id) => {
        return await Review.findById(id)
        .populate('userId')
        .populate('courseId')
        .exec();
    },

    createReview: async (data) => {
        const review = new Review(data);
        return await review.save();
    },

    updateReview: async (id, data) => {
        return await Review.findByIdAndUpdate(id, data, { new: true })
        .populate('userId')
        .populate('courseId')
        .exec();
    },
    
    deleteReview: async (id) => {
        return await Review.findByIdAndDelete(id).exec();
    },

    findByUserAndCourse: async (userId, courseId) => {
        return await Review.findOne({ userId, courseId }).exec();
    },

    getAllReviewsOfCourseAndAvgRating: async (courseId) => {
        const reviews = await Review.find({ courseId })
        .populate('courseId')
        .populate('userId')
        .exec();
        const avgRating = reviews.length
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;
        return { reviews, avgRating };
    },

    getAllReviewByUserId: async (userId) => {
        return await Review.find({ userId })
        .populate('userId')
        .populate('courseId')
        .exec();
    },

    save: async (data) => {
        return data.save();
    },
};

module.exports = reviewRepository;