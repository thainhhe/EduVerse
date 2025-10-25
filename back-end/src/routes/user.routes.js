const express = require("express");
const { verifyToken } = require("../middlewares/auth/authMiddleware");
const { userController } = require("../controllers/user/user.controller");

const userRouter = express.Router();
userRouter.get("/profile/:id", verifyToken, userController.getProfile);
userRouter.put("/profile/:id", verifyToken, userController.updateProfile);
userRouter.put("/close-account/:id", verifyToken, userController.closeAccount);

module.exports = userRouter;
