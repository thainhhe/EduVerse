const express = require("express");
const {
    register,
    login,
    updateProfile,
    getProfile,
    getAllUsers,
    assignPermissions,
} = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionMiddleware");

const userRouter = express.Router();

userRouter.get("/profile/:id", verifyToken, getProfile);
userRouter.get("/admin-manage", verifyToken, checkPermission(["admin"], ["manage_user"]), getAllUsers);
userRouter.put(
    "/admin-manage/permissions/:id",
    verifyToken,
    checkPermission(["admin"], ["access_permission_settings"]),
    assignPermissions
);
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.put("/profile/update/:id", verifyToken, updateProfile);

module.exports = userRouter;
