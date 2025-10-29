const Review = require("../models/Review");

const reviewRepository = {
    getAllReviews: async () => {
        return await Review.find().exec();
    },

    getReviewById: async (id) => {
        return await Review.findById(id).exec();
    },

    createReview: async (data) => {
        const review = new Review(data);
        return await review.save();
    },

    updateReview: async (id, data) => {
        return await Review.findByIdAndUpdate(id, data, { new: true }).exec();
    },
    
    deleteReview: async (id) => {
        return await Review.findByIdAndDelete(id).exec();
    },

    save: async (data) => {
        return data.save();
    },
};

module.exports = reviewRepository;