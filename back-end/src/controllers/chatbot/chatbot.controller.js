// back-end/src/controllers/chatbot/chatbot.controller.js
const axios = require("axios");
const { response, error_response } = require("../../utils/response.util");
const { STATUS_CODE } = require("../../config/enum/system.constant");
const ChatHistory = require("../../models/ChatHistory"); // --- THÊM DÒNG NÀY ---

// URL của service "build riêng"
const CHATBOT_SERVICE_URL =
  process.env.CHATBOT_SERVICE_URL || "http://localhost:5001/query";

const chatbotController = {
  async handleQuery(req, res) {
    try {
      // --- LẤY userId TỪ MIDDLEWARE checkLogin (nếu có) ---
      const userId = req.user ? req.user._id : null;

      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({
          success: false,
          message: "message is required",
          data: {},
        });
      }

      // Forward request to chatbot service
      const resp = await axios.post(CHATBOT_SERVICE_URL, {
        message,
        history,
      });

      // If service returns object { reply: ... } forward that structure
      const body = resp.data ?? {};
      const replyMessage = body.reply || "";

      // --- THÊM LOGIC LƯU HISTORY NẾU ĐÃ ĐĂNG NHẬP ---
      if (userId && replyMessage) {
        try {
          // Lưu non-blocking; log kết quả (nếu muốn, có thể chuyển sang upsert/push messages)
          ChatHistory.create({
            userId: userId,
            messages: [
              { sender: "user", message: message, timestamp: new Date() },
              { sender: "bot", message: replyMessage, timestamp: new Date() },
            ],
          }).catch((err) =>
            console.error(
              "Failed to save chat history (async):",
              err?.message || err
            )
          );
          console.log("Chat history saved (async) for user:", userId);
        } catch (saveError) {
          // Nếu lưu lỗi đồng bộ (hiếm), chỉ log ra chứ KHÔNG làm hỏng response
          console.error(
            "Failed to save chat history (sync):",
            saveError?.message || saveError
          );
        }
      }
      // -----------------------------------------------

      return res.json({ success: true, message: "", data: body });
    } catch (error) {
      console.error(
        "chatbotController.handleQuery error:",
        error?.message || error
      );
      return error_response(res, error, "Lỗi khi xử lý chatbot");
    }
  },
};
module.exports = chatbotController;
