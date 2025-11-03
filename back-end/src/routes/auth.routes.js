const express = require("express");
const { validate_schema } = require("../utils/response.util");
const { loginSchema, registerSchema, changePassSchema } = require("../validator/auth.validator");
const { authController } = require("../controllers/auth/auth.controller");
const { verifyToken } = require("../middlewares/auth/authMiddleware");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();

authRouter.post("/login", validate_schema(loginSchema), authController.login);
authRouter.post("/register", validate_schema(registerSchema), authController.register);
authRouter.post("/change-password/:id", verifyToken, validate_schema(changePassSchema), authController.changePassword);
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
authRouter.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    const user = req.user;
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${process.env.FRONTEND_URL}/google-auth/success?token=${token}`);
});

module.exports = authRouter;
