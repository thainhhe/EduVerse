// back-end/src/controllers/chatbot/chatbot.controller.js
const axios = require("axios");
const { response, error_response } = require("../../utils/response.util");
const { STATUS_CODE } = require("../../config/enum/system.constant");

// URL của service "build riêng"
const CHATBOT_SERVICE_URL =
  process.env.CHATBOT_SERVICE_URL || "http://localhost:5001/query";

const chatbotController = {
  async handleQuery(req, res) {
    try {
      const { message, history } = req.body;

      // Chuyển tiếp yêu cầu đến Chatbot Service
      const botResponse = await axios.post(CHATBOT_SERVICE_URL, {
        message,
        history: history || [],
      });

      // Trả kết quả (data.reply) từ Chatbot Service về cho Frontend
      return response(res, { data: botResponse.data });
    } catch (error) {
      console.error(
        "Lỗi khi gọi Chatbot Service:",
        error.response?.data || error.message
      );
      return error_response(res, {
        status: STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: "Lỗi kết nối đến trợ lý AI.",
      });
    }
  },
};
module.exports = chatbotController;
