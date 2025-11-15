// back-end/src/routes/chatbot.routes.js
const express = require("express");
const chatbotController = require("../controllers/chatbot/chatbot.controller");
const { checkLogin } = require("../middlewares/auth/authMiddleware");
const chatbotRouter = express.Router();

chatbotRouter.post("/query", checkLogin, chatbotController.handleQuery);

module.exports = chatbotRouter;
