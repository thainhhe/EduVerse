const { STATUS_CODE, USER_ERROR_MESSAGE, SYSTEM_MESSAGE } = require("../../config/enum");
const { userRepository } = require("../../repositories/user.repository");
const { authHelper } = require("../auth/auth.helper");

const userService = {
    async getProfile(id) {
        try {
            const result = await userRepository.findById(id);
            if (!result) return { status: STATUS_CODE.NOT_FOUND, message: USER_ERROR_MESSAGE.USER_NOT_FOUND };
            return { status: STATUS_CODE.OK, message: SYSTEM_MESSAGE.SUCCESS, data: result };
        } catch (error) {
            throw new Error(error.toString());
        }
    },
    async changePassword(id, new_password) {
        try {
            const user = await userRepository.findById(id);
            if (!user) return { status: STATUS_CODE.NOT_FOUND, message: USER_ERROR_MESSAGE.USER_NOT_FOUND };
            const newPassword = await authHelper.hashPassword(new_password);
            result.password = newPassword;
            await userRepository.save(user);
            return { status: STATUS_CODE.OK, message: SYSTEM_MESSAGE.SUCCESS, data: user };
        } catch (error) {
            throw new Error(error.toString());
        }
    },
};

module.exports = { userService };
