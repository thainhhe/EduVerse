const express = require("express");
const { manage_user_controller } = require("../../controllers/admin/manage-user/manage-user.controller");
const { verifyToken } = require("../../middlewares/auth/authMiddleware");
const { validate_schema } = require("../../utils/response.util");
const { userSchema } = require("../../validator/user.validator");
const upload = require("../../middlewares/system/upload.middleware");
const manage_user_router = express.Router();

manage_user_router.get("/", verifyToken, manage_user_controller.getAll);
manage_user_router.get("/:id", verifyToken, manage_user_controller.getUserById);
manage_user_router.post(
    "/create",
    verifyToken,
    validate_schema(userSchema),
    upload.single("avatar"),
    manage_user_controller.create_user
);
manage_user_router.put(
    "/update/:id",
    verifyToken,
    validate_schema(userSchema),
    upload.single("avatar"),
    manage_user_controller.update_user
);
manage_user_router.delete("/banned/:id", verifyToken, manage_user_controller.banned_account);
manage_user_router.put("/lock/:id", verifyToken, manage_user_controller.lock_user);
manage_user_router.put("/unlock/:id", verifyToken, manage_user_controller.unlock_user);

module.exports = manage_user_router;
