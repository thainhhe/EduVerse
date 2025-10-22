const authUtils = {
    async comparePasswords(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_JWT));
        return await bcrypt.hash(password, salt);
    },
    token(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
    },
};
