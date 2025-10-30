const express = require("express");
const { verifyToken } = require("../middlewares/auth/authMiddleware");
const { userController } = require("../controllers/user/user.controller");
const upload = require("../middlewares/system/upload.middleware");

const userRouter = express.Router();
userRouter.get("/profile/:id", verifyToken, userController.getProfile);
userRouter.put("/profile/:id", verifyToken, upload.single("avatar"), userController.updateProfile);
userRouter.put("/close-account/:id", verifyToken, userController.closeAccount);
userRouter.post("/reset-password", userController.request_reset_password);
userRouter.post("/verify-otp", userController.verify_otp_client);

module.exports = userRouter;
