// back-end/src/routes/chatbot.routes.js
const express = require("express");
const chatbotController = require("../controllers/chatbot/chatbot.controller");
const chatbotRouter = express.Router();

chatbotRouter.post("/query", chatbotController.handleQuery);
// (Có thể thêm middleware xác thực user ở đây nếu muốn)

module.exports = chatbotRouter;
