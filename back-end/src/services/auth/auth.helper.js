const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authHelper = {
  comparePasswords(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
  async hashPassword(password) {
    const rounds = parseInt(process.env.SALT_JWT) || 10; // fallback nếu SALT_JWT không định nghĩa
    const salt = await bcrypt.genSalt(rounds);
    return await bcrypt.hash(password, salt);
  },
  token(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  },
};

module.exports = { authHelper };
