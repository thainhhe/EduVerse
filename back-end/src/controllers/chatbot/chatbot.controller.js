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
      return res.json({ success: true, message: "", data: body });
    } catch (error) {
      console.error(
        "chatbotController.handleQuery error:",
        error?.message || error
      );
      return res.status(500).json({
        success: false,
        message: error?.message || "Internal error",
        data: {},
      });
    }
  },
};
module.exports = chatbotController;
