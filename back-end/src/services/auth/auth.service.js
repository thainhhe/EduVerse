const { auth_enum } = require("../../config/enum/auth.constants");
const system_enum = require("../../config/enum/system.constant");
const { userRepository } = require("../../repositories/user.repository");
const { authHelper } = require("./auth.helper");

const authService = {
  async register(data) {
    try {
      const existedEmail = await userRepository.findByEmail_Duplicate(
        data.email
      );
      if (existedEmail) {
        return {
          status: system_enum.STATUS_CODE.CONFLICT,
          message: auth_enum.AUTH_MESSAGE.EXISTING_EMAIL,
        };
      }
      const hashPass = await authHelper.hashPassword(data.password);

      // Build explicit create payload and ensure role is respected (fallback to learner)
      const createPayload = {
        username: data.username,
        email: data.email,
        password: hashPass,
        role: data.role || "learner",
        ...(data.avatar !== undefined && { avatar: data.avatar }),

        ...(data.job_title !== undefined && { job_title: data.job_title }),

        ...(data.subject_instructor !== undefined && {
          subject_instructor: data.subject_instructor,
        }),

        ...(data.subjects !== undefined && { subjects: data.subjects }),
      };
      const newUser = await userRepository.create(createPayload);
      return {
        status: system_enum.STATUS_CODE.OK,
        message: auth_enum.AUTH_MESSAGE.REGISTER_SUCCESS,
        data: authHelper.format_user_data(newUser),
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
          status: system_enum.STATUS_CODE.NOT_FOUND,
          message: auth_enum.AUTH_MESSAGE.USER_NOT_FOUND,
        };
      }
      const isMatch = await authHelper.comparePasswords(
        password,
        user.password
      );
      if (!isMatch) {
        return {
          status: system_enum.STATUS_CODE.CONFLICT,
          message: auth_enum.AUTH_MESSAGE.WRONG_PASSWORD,
        };
      }
      const token = authHelper.token(user._id);
      return {
        status: system_enum.STATUS_CODE.OK,
        message: auth_enum.AUTH_MESSAGE.LOGIN_SUCCESS,
        data: authHelper.format_user_data(user, token),
      };
    } catch (error) {
      throw new Error(error);
    }
  },
  async changePassword(id, newPassword) {
    try {
      if (!id)
        return {
          status: system_enum.STATUS_CODE.CONFLICT,
          message: auth_enum.AUTH_MESSAGE.MISSING_INFORMATION,
        };
      const user = await userRepository.findById(id);
      if (!user)
        return {
          status: system_enum.STATUS_CODE.NOT_FOUND,
          message: auth_enum.AUTH_MESSAGE.USER_NOT_FOUND,
        };

      const new_password = await authHelper.hashPassword(newPassword);
      user.password = new_password;
      await userRepository.save(user);
      return {
        status: system_enum.STATUS_CODE.OK,
        message: auth_enum.AUTH_MESSAGE.CHANGE_PASSWORD_SUCCESS,
        data: authHelper.format_user_data(user),
      };
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = { authService };
