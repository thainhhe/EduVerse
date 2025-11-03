const { userRepository } = require("../../repositories/user.repository");
const { authHelper } = require("../auth/auth.helper");

const googleService = {
    findOrCreate: async (profile) => {
        try {
            const email = profile.emails[0].value;
            const name = profile.displayName;
            const googleId = profile.id;
            const avatar = profile.photos?.[0]?.value;
            let user = await userRepository.findByEmail(email);
            if (!user) {
                user = await userRepository.create({
                    username: name,
                    email,
                    googleId,
                    avatar,
                    password: await authHelper.hashPassword("123456"),
                });
            }
            return user;
        } catch (err) {
            throw err;
        }
    },
};

module.exports = googleService;
