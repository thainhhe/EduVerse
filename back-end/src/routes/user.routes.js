const express = require("express");
const { verifyToken } = require("../middlewares/auth/authMiddleware");
const { userController } = require("../controllers/user/user.controller");
const upload = require("../middlewares/system/upload.middleware");
const { permissionController } = require("../controllers/permission/permission.controller");
const userRouter = express.Router();

userRouter.get("/profile/:id", userController.getProfile);
userRouter.get("/instructor/popular", userController.getPopularInstructors);
userRouter.get("/instructor", userController.getInstructor);
userRouter.put("/profile/:id", verifyToken, upload.single("avatar"), userController.updateProfile);
userRouter.put("/close-account/:id", verifyToken, userController.closeAccount);
userRouter.post("/reset-password", userController.request_reset_password);
userRouter.post("/verify-otp", userController.verify_otp_client);
userRouter.post("/permission", permissionController.assign_permission);
userRouter.get("/permission", permissionController.getAll);
userRouter.post("/permission/invite", permissionController.request_invite);

module.exports = userRouter;
