const {
  STATUS_CODE,
  INPUT_ERROR,
  SYSTEM_MESSAGE,
  USER_ERROR_MESSAGE,
  AUTH_ERROR_MESSAGE,
} = require("../../config/enum/index");
// const { ROLE } = require("../../config/permissions.constants");
const { userRepository } = require("../../repositories/user.repository");
const { authHelper } = require("./auth.helper");

const authService = {
  async register(data) {
    try {
      const existedEmail = await userRepository.findByEmail(data.email);
      if (existedEmail) {
        return {
          status: STATUS_CODE.CONFLICT,
          message: INPUT_ERROR.EXISTING_EMAIL,
        };
      }
      const hashPassword = await authHelper.hashPassword(data.password);
      data.password = hashPassword;
      const newUser = await userRepository.createUser(data);
      const userData = {
        ...newUser._doc,
        password: "xxxxxx",
      };
      return {
        status: STATUS_CODE.OK,
        message: SYSTEM_MESSAGE.SUCCESS,
        data: userData,
      };
    } catch (error) {
      throw new Error(error);
    }
  },
  async login(email, password) {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        return {
          status: STATUS_CODE.NOT_FOUND,
          message: USER_ERROR_MESSAGE.USER_NOT_FOUND,
        };
      }
      const isMatch = await authHelper.comparePasswords(
        password,
        user.password
      );
      if (!isMatch) {
        return {
          status: STATUS_CODE.CONFLICT,
          message: AUTH_ERROR_MESSAGE.INVALID_CREDENTIALS,
        };
      }
      const token = authHelper.token(user._id);
      const userData = {
        ...user._doc,
        password: "xxxxxx",
        token: token,
      };
      return {
        status: STATUS_CODE.OK,
        message: SYSTEM_MESSAGE.SUCCESS,
        data: userData,
      };
    } catch (error) {
      throw new Error(error);
    }
  },
  async changePassword(id, newPassword) {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        return {
          status: STATUS_CODE.NOT_FOUND,
          message: USER_ERROR_MESSAGE.USER_NOT_FOUND,
        };
      }
      const new_password = await authHelper.hashPassword(newPassword);
      user.password = new_password;
      await userRepository.save(user);
      return {
        status: STATUS_CODE.OK,
        message: SYSTEM_MESSAGE.SUCCESS,
        data: user,
      };
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = { authService };
