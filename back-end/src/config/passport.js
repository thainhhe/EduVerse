const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const googleService = require("../services/google/google.service");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await googleService.findOrCreate(profile);
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const User = require("../models/User");
    const user = await User.findById(id);
    done(null, user);
});

module.exports = passport;
