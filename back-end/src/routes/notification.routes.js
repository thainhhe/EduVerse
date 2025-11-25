const express = require("express");
const { notificationController } = require("../controllers/notification/notification.controller");
const { verifyToken } = require("../middlewares/auth/authMiddleware");

const notificationRouter = express.Router();
notificationRouter.get("/", verifyToken, notificationController.getAll);
notificationRouter.get("/global", notificationController.get_global);
notificationRouter.get("/sender/:id", verifyToken, notificationController.get_by_senderId);
notificationRouter.get("/receiver/:id", verifyToken, notificationController.get_by_receiveId);
notificationRouter.post("/create", verifyToken, notificationController.create_notification);
notificationRouter.put("/update/:id", verifyToken, notificationController.update_notification);
notificationRouter.delete("/delete/:id", verifyToken, notificationController.delete_notification);
notificationRouter.put("/read/:id", verifyToken, notificationController.mark_as_read);
notificationRouter.put("/read-all/:userId", verifyToken, notificationController.mark_all_as_read);

module.exports = notificationRouter;
