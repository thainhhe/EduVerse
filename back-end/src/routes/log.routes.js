const express = require("express");
const { logController } = require("../controllers/log/log.controller");
const { verifyToken } = require("../middlewares/auth/authMiddleware");

const logRouter = express.Router();
logRouter.get("/:limit", verifyToken, logController.read_log);
logRouter.delete("/clear-log", verifyToken, logController.clear_log);

module.exports = logRouter;
