const { system_enum } = require("../../config/enum/system.constant");
const { user_enum } = require("../../config/enum/user.constants");
const { userRepository } = require("../../repositories/user.repository");
const { generateOtp, hashOtp, sendOtpEmail, compareOtp } = require("../../utils/mail.util");
const { upLoadImage } = require("../../utils/response.util");
const { userHelper } = require("./user.helper");
const { authHelper } = require("../auth/auth.helper");
const courseRepository = require("../../repositories/course.repository");

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
            const result = await courseRepository.getInstructor_sort_by_rating();
            if (!result)
                return { status: system_enum.STATUS_CODE.NOT_FOUND, message: user_enum.USER_MESSAGE.USER_NOT_FOUND };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: user_enum.USER_MESSAGE.GET_PROFILE_SUCCESS,
                data: result,
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

    requestResetPassword: async (email) => {
        try {
            if (!email)
                return { status: system_enum.STATUS_CODE.CONFLICT, message: user_enum.USER_MESSAGE.FAIL_GET_DATA };
            const user = await userRepository.findByEmail(email);
            if (!user)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: user_enum.USER_MESSAGE.USER_NOT_FOUND,
                };
            const otp = generateOtp(6);
            const otpHash = await hashOtp(otp);
            user.resetOtpHash = otpHash;
            user.resetOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
            user.resetOtpAttempts = 0;
            await userRepository.save(user);
            await sendOtpEmail(user.email, otp);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SEND_MAIL_OTP_SUCCESS,
            };
        } catch (err) {
            throw new Error(err);
        }
    },

    verify_otp: async (email, otp) => {
        if (!email)
            return {
                status: system_enum.STATUS_CODE.NOT_FOUND,
                message: user_enum.USER_MESSAGE.USER_NOT_FOUND,
            };
        if (!otp)
            return {
                status: system_enum.STATUS_CODE.NOT_FOUND,
                message: system_enum.SYSTEM_MESSAGE.NOT_FOUND_OTP,
            };
        try {
            const user = await userRepository.findByEmail(email);
            if (!user || !user.resetOtpHash || !user.resetOtpExpires)
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: system_enum.SYSTEM_MESSAGE.INVALID_OTP,
                };
            if (user.resetOtpExpires < new Date()) {
                user.resetOtpHash = null;
                user.resetOtpExpires = null;
                user.resetOtpAttempts = 0;
                await userRepository.save(user);
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: system_enum.SYSTEM_MESSAGE.OTP_EXPIRED,
                };
            }
            user.resetOtpAttempts = user.resetOtpAttempts || 0;
            if (user.resetOtpAttempts >= 5) {
                user.resetOtpHash = null;
                user.resetOtpExpires = null;
                user.resetOtpAttempts = 0;
                await userRepository.save(user);
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: system_enum.SYSTEM_MESSAGE.TOO_MANY_ATTEMPT_OTP,
                };
            }

            const match = await compareOtp(otp, user.resetOtpHash);
            if (!match) {
                user.resetOtpAttempts += 1;
                await user.save();
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: system_enum.SYSTEM_MESSAGE.INVALID_OTP,
                };
            }
            user.resetOtpHash = null;
            user.resetOtpExpires = null;
            user.resetOtpAttempts = 0;
            user.password = await authHelper.hashPassword("123456");
            await userRepository.save(user);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.RESET_PASSWORD_SUCCESS,
            };
        } catch (err) {
            throw new Error(err);
        }
    },

    assignPermission: async (data) => {
        try {
            const result = await userRepository.update(data);
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
