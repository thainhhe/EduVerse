const systemEnum = require("../../config/enum/system.constant");
const reviewEnum = require("../../config/enum/review.constants");
const reviewRepository = require("../../repositories/review.repository");
const reviewValidator = require("../../validator/review.validator");
const reviewHelper = require("./review.helper");

const reviewServices = {
    getAllReviews: async () => {
        try {
            const reviews = await reviewRepository.getAll();
            return {
                status: systemEnum.STATUS_CODE.OK,
                message: systemEnum.SYSTEM_MESSAGE.SUCCESS,
                data: reviewHelper.formatReviews(reviews),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    getReviewById: async (id) => {
        try {
            const review = await reviewRepository.getById(id);

            if (!review) {
                return {
                    status: systemEnum.STATUS_CODE.NOT_FOUND,
                    message: reviewEnum.REVIEW_MESSAGE.REVIEW_NOT_FOUND,
                };
            }

            return {
                status: systemEnum.STATUS_CODE.OK,
                message: systemEnum.SYSTEM_MESSAGE.SUCCESS,
                data: reviewHelper.formatReview(review),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    createReview: async (reviewData) => {
        try {
            const validatedData = reviewValidator.validateReviewData(reviewData, false);

            const newReview = await reviewRepository.create(validatedData);

            return {
                status: systemEnum.STATUS_CODE.CREATED,
                message: reviewEnum.REVIEW_MESSAGE.CREATE_SUCCESS,
                data: reviewHelper.formatReview(newReview),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    updateReview: async (id, reviewData) => {
        try {
            const validatedData = reviewValidator.validateReviewData(reviewData, true);

            const existingReview = await reviewRepository.getById(id);
            if (!existingReview) {
                return {
                    status: systemEnum.STATUS_CODE.NOT_FOUND,
                    message: reviewEnum.REVIEW_MESSAGE.REVIEW_NOT_FOUND,
                };
            }

            const updatedReview = await reviewRepository.update(id, validatedData);
            return {
                status: systemEnum.STATUS_CODE.OK,
                message: reviewEnum.REVIEW_MESSAGE.UPDATE_SUCCESS,
                data: reviewHelper.formatReview(updatedReview),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

};

module.exports = reviewServices;