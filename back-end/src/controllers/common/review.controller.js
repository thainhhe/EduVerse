const Review = require('../../models/Review.js');

// Get all reviews for a course
const getReviewsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const reviews = await Review.find({ courseId }).populate('userId', 'name');

        const averageRating = reviews.length
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;
        
        res.status(200).json({ reviews, averageRating });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};


module.exports = {
    getReviewsByCourse,
};