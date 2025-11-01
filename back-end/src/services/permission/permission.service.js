const { system_enum } = require("../../config/enum/system.constant");
const { user_enum } = require("../../config/enum/user.constants");
const { permissionRepository } = require("../../repositories/permission.repository");
const { userRepository } = require("../../repositories/user.repository");
const { sendInviteInstructorEmail } = require("../../utils/mail.util");

const permissionService = {
    getAll: async () => {
        try {
            const result = await permissionRepository.findAll();
            if (!result || result.length === 0)
                return { status: system_enum.STATUS_CODE.NOT_FOUND, message: "Not Found" };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: "",
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    assignPermission: async (dataList) => {
        try {
            if (!Array.isArray(dataList) || dataList.length === 0) {
                return {
                    status: system_enum.STATUS_CODE.BAD_REQUEST,
                    message: "Danh sách người dùng không hợp lệ hoặc trống",
                };
            }

            const results = [];

            for (const item of dataList) {
                const { email, permission } = item;

                if (!email || !permission) {
                    results.push({
                        email,
                        success: false,
                        message: "Thiếu email hoặc quyền hạn",
                    });
                    continue;
                }

                const user = await userRepository.findByEmail(email);
                if (!user) {
                    results.push({
                        email,
                        success: false,
                        message: "Không tìm thấy người dùng",
                    });
                    continue;
                }

                user.permissions = permission;
                await userRepository.save(user);

                results.push({
                    email,
                    success: true,
                    message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                });
            }
            return {
                status: system_enum.STATUS_CODE.OK,
                message: user_enum.USER_MESSAGE.ASSIGN_PERMISSION_SUCCESS,
                data: results,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    request_invite: async (data) => {
        try {
            if (!data.to || !data.inviteLink || !data.courseName)
                return {
                    status: system_enum.STATUS_CODE.BAD_REQUEST,
                    message: "Lỗi thông tin.",
                };
            sendInviteInstructorEmail(data.to, data.inviteLink, data.inviterName, data.courseName);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SEND_MAIL_OTP_SUCCESS,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
};

module.exports = { permissionService };
