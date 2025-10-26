const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authHelper = {
  comparePasswords(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
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
  format_user_data(data, token_) {
    return {
      _id: data._id,
      username: data.username,
      email: data.email,
      avatar: data.avatar !== null ? data.avatar : "",
      token: token_,
    };
  },
};

module.exports = { authHelper };
