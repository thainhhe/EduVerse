const { system_enum } = require("../../config/enum/system.constant");
const { user_enum } = require("../../config/enum/user.constants");
const { userRepository } = require("../../repositories/user.repository");
const { upLoadImage } = require("../../utils/response.util");
const { userHelper } = require("./user.helper");

const userService = {
    getProfile: async (id) => {
        try {
            if (!id) return { status: system_enum.STATUS_CODE.CONFLICT, message: user_enum.USER_MESSAGE.FAIL_GET_DATA };
            const result = await userRepository.findById(id);
            if (!result)
                return { status: system_enum.STATUS_CODE.NOT_FOUND, message: user_enum.USER_MESSAGE.USER_NOT_FOUND };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: user_enum.USER_MESSAGE.GET_PROFILE_SUCCESS,
                data: userHelper.format_user_information(result),
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    getInstructorProfile: async () => {
        try {
            const result = await userRepository.findInstructor();
            if (!result)
                return { status: system_enum.STATUS_CODE.NOT_FOUND, message: user_enum.USER_MESSAGE.USER_NOT_FOUND };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: user_enum.USER_MESSAGE.GET_PROFILE_SUCCESS,
                data: userHelper.format_user_information(result),
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    updateProfile: async (id, data, file) => {
        try {
            if (!id) {
                return {
                    status: system_enum.STATUS_CODE.BAD_REQUEST,
                    message: user_enum.USER_MESSAGE.FAIL_GET_DATA,
                };
            }

            if (file !== null) {
                const img = await upLoadImage(file);
                data.avatar = img;
            }

            const result = await userRepository.update(id, data);
            if (!result) {
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: user_enum.USER_MESSAGE.USER_NOT_FOUND,
                };
            }
            return {
                status: system_enum.STATUS_CODE.OK,
                message: user_enum.USER_MESSAGE.UPDATE_PROFILE_SUCCESS,
                data: userHelper.format_user_information(result),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    closeAccount: async (id) => {
        try {
            if (!id) return { status: system_enum.STATUS_CODE.CONFLICT, message: user_enum.USER_MESSAGE.FAIL_GET_DATA };
            const user = await userRepository.close(id);
            if (!user)
                return { status: system_enum.STATUS_CODE.NOT_FOUND, message: user_enum.USER_MESSAGE.USER_NOT_FOUND };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: user_enum.USER_MESSAGE.CLOSE_ACCOUNT_SUCCESS,
                data: userHelper.format_user_information(user),
            };
        } catch (error) {
            throw new Error(error);
        }
    },
};

module.exports = { userService };
