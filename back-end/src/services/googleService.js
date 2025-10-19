const User = require("../models/User");

class GoogleService {
    async findOrCreate(profile) {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
            });
        } else {
            if (!user.googleId) {
                user.googleId = profile.id;
                if (!user.avatar) {
                    user.avatar = profile.photos[0].value;
                }
                await user.save();
            }
        }
        return user;
    }
}

module.exports = new GoogleService();
