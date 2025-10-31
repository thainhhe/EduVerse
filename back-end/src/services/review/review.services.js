const systemEnum = require("../../config/enum/system.constant");
const { review_enum } = require("../../config/enum/review.constants");
const reviewRepository = require("../../repositories/review.repository");
const { reviewValidator } = require("../../validator/review.validator");
const reviewHelper = require("./review.helper");

const reviewServices = {
    getAllReviews: async () => {
        try {
            const reviews = await reviewRepository.getAllReviews();
            return {
                status: systemEnum.STATUS_CODE.OK,
                message: systemEnum.SYSTEM_MESSAGE.SUCCESS,
                data: reviews.map(review => reviewHelper.formatReviewForResponse(review)),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    getReviewById: async (id) => {
        try {
            const review = await reviewRepository.getReviewById(id);

            if (!review) {
                return {
                    status: systemEnum.STATUS_CODE.NOT_FOUND,
                    message: review_enum.REVIEW_MESSAGE.REVIEW_NOT_FOUND,
                };
            }

            return {
                status: systemEnum.STATUS_CODE.OK,
                message: systemEnum.SYSTEM_MESSAGE.SUCCESS,
                data: reviewHelper.formatReviewForResponse(review),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    createReview: async (reviewData) => {
        try {
            console.log('Service received reviewData:', reviewData);
            
            // Clean data trước khi validate
            const cleanedData = reviewHelper.cleanedReviewData(reviewData);
            console.log('Cleaned data:', cleanedData);
            
            // Validate data
            const validatedData = reviewValidator.validateReviewData(cleanedData, false);
            console.log('Validated data:', validatedData);

            // ✅ KIỂM TRA DUPLICATE REVIEW
            const existingReview = await reviewRepository.findByUserAndCourse(
                validatedData.userId, 
                validatedData.courseId
            );

            if (existingReview) {
                return {
                    status: systemEnum.STATUS_CODE.CONFLICT, // 409
                    message: review_enum.REVIEW_MESSAGE.DUPLICATE_REVIEW,
                };
            }

            // Tạo review mới
            const newReview = await reviewRepository.createReview(validatedData);

            return {
                status: systemEnum.STATUS_CODE.CREATED,
                message: review_enum.REVIEW_MESSAGE.CREATE_SUCCESS,
                data: reviewHelper.formatReviewForResponse(newReview),
            };
        } catch (error) {
            console.error('Error in createReview service:', error);
            // Xử lý lỗi validation
            if (error.message.startsWith('[') || error.message.startsWith('{')) {
                return {
                    status: systemEnum.STATUS_CODE.BAD_REQUEST,
                    message: error.message,
                };
            }
            throw error;
        }
    },

    updateReview: async (id, reviewData) => {
        try {
            // Kiểm tra review có tồn tại không
            const existingReview = await reviewRepository.getReviewById(id);
            if (!existingReview) {
                return {
                    status: systemEnum.STATUS_CODE.NOT_FOUND,
                    message: review_enum.REVIEW_MESSAGE.REVIEW_NOT_FOUND,
                };
            }

            // Clean data trước khi validate
            const cleanedData = reviewHelper.cleanedReviewData(reviewData);
            
            // Validate data
            const validatedData = reviewValidator.validateReviewData(cleanedData, true);

            // Update review
            const updatedReview = await reviewRepository.updateReview(id, validatedData);
            
            return {
                status: systemEnum.STATUS_CODE.OK,
                message: review_enum.REVIEW_MESSAGE.UPDATE_SUCCESS,
                data: reviewHelper.formatReviewForResponse(updatedReview),
            };
        } catch (error) {
            // Xử lý lỗi validation
            if (error.message.startsWith('[') || error.message.startsWith('{')) {
                return {
                    status: systemEnum.STATUS_CODE.BAD_REQUEST,
                    message: error.message,
                };
            }
            throw new Error(error);
        }
    },

    deleteReview: async (id) => {
        try {
            // Kiểm tra review có tồn tại không
            const existingReview = await reviewRepository.getReviewById(id);
            if (!existingReview) {
                return {
                    status: systemEnum.STATUS_CODE.NOT_FOUND,
                    message: review_enum.REVIEW_MESSAGE.REVIEW_NOT_FOUND,
                };
            }

            // Xóa review
            await reviewRepository.deleteReview(id);

            return {
                status: systemEnum.STATUS_CODE.OK,
                message: review_enum.REVIEW_MESSAGE.DELETE_SUCCESS,
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    getAllReviewsOfCourseAndAvgRating: async (courseId) => {
        try {
            const result = await reviewRepository.getAllReviewsOfCourseAndAvgRating(courseId);
            return {
                status: systemEnum.STATUS_CODE.OK,
                message: review_enum.REVIEW_MESSAGE.GET_ALL_SUCCESS,
                data: result,
            };
        } catch (error) {
            console.error('Error in getAllReviewsOfCourseAndAvgRating service:', error);
            throw new Error(error);
        }
    },

    getAllReviewByUserId: async (userId) => {
        try {
            const reviews = await reviewRepository.getAllReviewByUserId(userId);
            return {
                status: systemEnum.STATUS_CODE.OK,
                message: review_enum.REVIEW_MESSAGE.GET_ALL_SUCCESS,
                data: reviews.map(review => reviewHelper.formatReviewForResponse(review)),
            };
        } catch (error) {
            console.error('Error in getAllReviewByUserId service:', error);
            throw new Error(error);
        }
    },

};

module.exports = reviewServices;