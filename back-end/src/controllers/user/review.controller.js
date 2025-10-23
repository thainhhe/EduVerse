const Review = require("../../models/Review.js");

// Create a new review
const createReview = async (req, res) => {
    try {
        const { userId, courseId, rating, comment } = req.body;
        const newReview = new Review({ userId, courseId, rating, comment });
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (error) {
        res.status(500).json({ message: 'Error creating review', error });
    }
};

// Update review
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const updatedReview = await Review.findByIdAndUpdate(reviewId, { rating, comment, updatedAt: Date.now() }, { new: true });
        if (!updatedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error });
    }
};

// Delete review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const deletedReview = await Review.findByIdAndDelete(reviewId);
        if (!deletedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error });
    }
};

module.exports = {
    createReview,
    updateReview,
    deleteReview,
};