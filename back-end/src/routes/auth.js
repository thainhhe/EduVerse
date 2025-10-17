const express = require("express");
const authRouter = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

authRouter.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/failure" }),
    (req, res) => {
        const user = req.user;
        const token = jwt.sign({ id: user._id, email: user.email, name: user.username }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.json({ token, user });
    }
);

authRouter.get("/failure", (req, res) => {
    res.status(401).json({ message: "Google login failed" });
});

module.exports = authRouter;
