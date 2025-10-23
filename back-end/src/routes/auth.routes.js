const express = require("express");
const { validate_schema } = require("../utils/response.util");
const { loginSchema, registerSchema } = require("../validator/auth.validator");
const { authController } = require("../controllers/auth/auth.controller");

const authRouter = express.Router();

authRouter.post("/login", validate_schema(loginSchema), authController.login);
authRouter.post("/register", validate_schema(registerSchema), authController.register);

module.exports = authRouter;
