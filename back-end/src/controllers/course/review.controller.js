const reviewServices = require('../../services/review/review.services');
const systemEnum = require('../../config/enum/system.constant');

const getAllReviews = async (req, res) => {
    try {
        const result = await reviewServices.getAllReviews();
        res.status(result.status).json({
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        res.status(systemEnum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            message: systemEnum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
        });
    }
};

const getReviewById = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const result = await reviewServices.getReviewById(reviewId);
        res.status(result.status).json({
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        res.status(systemEnum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            message: systemEnum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
        });
    }
};

const createReview = async (req, res) => {
    try {
        const reviewData = req.body;
        const result = await reviewServices.createReview(reviewData);
        res.status(result.status).json({
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        res.status(systemEnum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            message: systemEnum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
        });
    }
};

const updateReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const reviewData = req.body;
        const result = await reviewServices.updateReview(reviewId, reviewData);
        res.status(result.status).json({
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        res.status(systemEnum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            message: systemEnum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
        });
    }
};

const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const result = await reviewServices.deleteReview(reviewId);
        res.status(result.status).json({
            message: result.message,
        });
    } catch (error) {
        res.status(systemEnum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            message: systemEnum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
        });
    }
};

module.exports = {
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview
};