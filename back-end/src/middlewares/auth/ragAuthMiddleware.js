// src/middlewares/auth/ragAuthMiddleware.js
const { sendError } = require("../../utils/response.util");

/**
 * Middleware này xác thực các yêu cầu nội bộ từ
 * các service khác (như chatbot-service) bằng
 * một API key bí mật.
 */
const requireInternalAPIKey = (req, res, next) => {
  const internalKey = process.env.INTERNAL_API_KEY;
  const requestKey = req.headers["x-internal-api-key"];

  if (!internalKey) {
    // Lỗi cấu hình server
    console.error("INTERNAL_API_KEY is not set in .env");
    return sendError(res, 500, "Internal Server Configuration Error");
  }

  if (requestKey && requestKey === internalKey) {
    // Khóa hợp lệ, cho phép tiếp tục
    return next();
  }

  // Khóa không hợp lệ hoặc bị thiếu
  return sendError(res, 403, "Forbidden: Invalid or missing API key");
};

module.exports = { requireInternalAPIKey };
