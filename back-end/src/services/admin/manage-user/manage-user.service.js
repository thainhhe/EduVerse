const { auth_enum } = require("../../../config/enum/auth.constants");
const { system_enum } = require("../../../config/enum/system.constant");
const { userRepository } = require("../../../repositories/user.repository");
const { adminUserRepository } = require("../../../repositories/admin-user.repository");
const { upLoadImage } = require("../../../utils/response.util");
const { authHelper } = require("../../auth/auth.helper");
const User = require("../../../models/User");

const manage_user_service = {
    getAllUser: async () => {
        try {
            const data = await userRepository.findAll();
            if (!data || data.length === 0)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.FAIL_GET_DATA,
                };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: data,
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    getUserById: async (id) => {
        try {
            const data = await adminUserRepository.findByIdWithDetails(id);
            if (!data)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.FAIL_GET_DATA,
                };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: data,
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    createUser: async (data, file = null) => {
        try {
            const existedEmail = await userRepository.findByEmail_Duplicate(data.email);
            if (existedEmail) {
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: auth_enum.AUTH_MESSAGE.EXISTING_EMAIL,
                };
            }
            if (file) {
                const img = await upLoadImage(file);
                data.avatar = img;
            }
            const hashPass = await authHelper.hashPassword(data.password);
            data.password = hashPass;
            const newUser = await userRepository.create(data);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: newUser,
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    updateUser: async (id, data, file = null) => {
        try {
            if (file) {
                const img = await upLoadImage(file);
                data.avatar = img;
            }
            if (data.email !== null) {
                const existed = await userRepository.findDuplicateEmailExceptSelf(data.email, id);
                if (existed)
                    return {
                        status: system_enum.STATUS_CODE.CONFLICT,
                        message: auth_enum.AUTH_MESSAGE.EXISTING_EMAIL,
                    };
            }
            const result = await userRepository.update(id, data);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    banUser: async (id) => {
        try {
            const result = await userRepository.banned(id);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    lockUser: async (id) => {
        try {
            const result = await User.findOneAndUpdate(
                { _id: id, isSuperAdmin: false },
                { status: "banned" },
                { new: true }
            );
            if (!result) {
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.FAIL_GET_DATA,
                };
            }
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    unlockUser: async (id) => {
        try {
            const result = await User.findOneAndUpdate(
                { _id: id, isSuperAdmin: false },
                { status: "active" },
                { new: true }
            );
            if (!result) {
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.FAIL_GET_DATA,
                };
            }
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
};

module.exports = { manage_user_service };
