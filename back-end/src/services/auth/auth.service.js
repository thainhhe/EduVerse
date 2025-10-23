const { auth_enum } = require("../../config/enum/auth.constants");
const { system_enum } = require("../../config/enum/system.constant");
const { userRepository } = require("../../repositories/user.repository");
const { authHelper } = require("./auth.helper");

const authService = {
    async register(data) {
        try {
            const existedEmail = await userRepository.findByEmail(data.email);
            if (existedEmail) {
                return { status: system_enum.STATUS_CODE.OK, message: auth_enum.AUTH_MESSAGE.EXISTING_EMAIL };
            }
            const hashPass = await authHelper.hashPassword(data.password);
            data.password = hashPass;
            const newUser = await userRepository.createUser(data);
            const userData = {
                ...newUser._doc,
                password: "xxxxxx",
            };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: auth_enum.AUTH_MESSAGE.REGISTER_SUCCESS,
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
                return { status: system_enum.STATUS_CODE.NOT_FOUND, message: auth_enum.AUTH_MESSAGE.USER_NOT_FOUND };
            }
            const isMatch = await authHelper.comparePasswords(password, user.password);
            if (!isMatch) {
                return { status: system_enum.STATUS_CODE.CONFLICT, message: auth_enum.AUTH_MESSAGE.WRONG_PASSWORD };
            }
            const token = authHelper.token(user._id);
            const userData = {
                ...user._doc,
                password: "xxxxxx",
                token: token,
            };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: auth_enum.AUTH_MESSAGE.LOGIN_SUCCESS,
                data: userData,
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
                return { status: system_enum.STATUS_CODE.NOT_FOUND, message: auth_enum.AUTH_MESSAGE.USER_NOT_FOUND };

            const new_password = await authHelper.hashPassword(newPassword);
            user.password = new_password;
            await userRepository.save(user);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: auth_enum.AUTH_MESSAGE.CHANGE_PASSWORD_SUCCESS,
                data: user,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
};

module.exports = { authService };
