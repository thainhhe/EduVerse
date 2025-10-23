const express = require("express");
const { validate_schema } = require("../utils/response.util");
const { loginSchema, registerSchema, changePassSchema } = require("../validator/auth.validator");
const { authController } = require("../controllers/auth/auth.controller");

const authRouter = express.Router();

authRouter.post("/login", validate_schema(loginSchema), authController.login);
authRouter.post("/register", validate_schema(registerSchema), authController.register);
authRouter.post("/change-password/:id", validate_schema(changePassSchema), authController.changePassword);

module.exports = authRouter;
