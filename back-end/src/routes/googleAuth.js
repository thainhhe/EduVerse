const passport = require("passport");

const googleRouter = require("express").Router();

googleRouter.get("/", passport.authenticate("google", { scope: ["profile", "email"] }));

googleRouter.get(
    "/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: true }),
    (req, res) => {
        const user = req.user;
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.redirect(`${process.env.FRONTEND_URL}/success?token=${token}`);
    }
);

module.exports = googleRouter;
