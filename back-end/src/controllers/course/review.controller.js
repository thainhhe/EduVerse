const reviewServices = require("../../services/review/review.services");
const systemEnum = require("../../config/enum/system.constant");

const getAllReviews = async (req, res) => {
  try {
    const result = await reviewServices.getAllReviews();
    res.status(result.status).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in getAllReviews:", error);
    res.status(systemEnum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: systemEnum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
    console.error("Error in getReviewById:", error);
    res.status(systemEnum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: systemEnum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const createReview = async (req, res) => {
  try {
    const reviewData = req.body;

    // Debug log
    console.log("Creating review with data:", reviewData);

    const result = await reviewServices.createReview(reviewData);

    // Service trả về status từ logic bên trong
    return res.status(result.status).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in createReview:", error);

    // Kiểm tra xem có phải lỗi validation không
    try {
      const parsedError = JSON.parse(error.message);
      if (Array.isArray(parsedError)) {
        return res.status(systemEnum.STATUS_CODE.BAD_REQUEST).json({
          message: "Validation failed",
          errors: parsedError,
        });
      }
    } catch (e) {
      // Không phải JSON, xử lý như lỗi thường
    }

    res.status(systemEnum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: systemEnum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const reviewData = req.body;

    console.log("Updating review:", reviewId, "with data:", reviewData);

    const result = await reviewServices.updateReview(reviewId, reviewData);
    console.log("result in controller", result);
    return res.status(result.status).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in updateReview:", error);

    // Kiểm tra xem có phải lỗi validation không
    try {
      const parsedError = JSON.parse(error.message);
      if (Array.isArray(parsedError)) {
        return res.status(systemEnum.STATUS_CODE.BAD_REQUEST).json({
          message: "Validation failed",
          errors: parsedError,
        });
      }
    } catch (e) {
      // Không phải JSON
    }

    res.status(systemEnum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: systemEnum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
    console.error("Error in deleteReview:", error);
    res.status(systemEnum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: systemEnum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAllReviewsOfCourseAndAvgRating = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const result = await reviewServices.getAllReviewsOfCourseAndAvgRating(
      courseId
    );
    res.status(result.status).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in getAllReviewsOfCourseAndAvgRating:", error);
    res.status(systemEnum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: systemEnum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAllReviewByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await reviewServices.getAllReviewByUserId(userId);
    res.status(result.status).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in getAllReviewByUserId:", error);
    res.status(systemEnum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: systemEnum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getAllReviewsOfCourseAndAvgRating,
  getAllReviewByUserId,
};
