const { system_enum } = require("../../config/enum/system.constant");
const { user_enum } = require("../../config/enum/user.constants");
const Permission = require("../../models/Permission");
const { courseRepository } = require("../../repositories/course.repository");
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
    assignPermission: async (data) => {
        try {
            const { currentCourseId, instructors } = data;

            if (!currentCourseId)
                return {
                    status: system_enum.STATUS_CODE.BAD_REQUEST,
                    message: "currentCourseId is required",
                };

            if (!Array.isArray(instructors) || instructors.length === 0)
                return {
                    status: system_enum.STATUS_CODE.BAD_REQUEST,
                    message: "instructors array is required",
                };

            const course = await courseRepository.getById(currentCourseId);
            if (!course)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.NOT_FOUND,
                };

            const results = [];

            for (const item of instructors) {
                const { email, permissions } = item;

                if (!email) {
                    results.push({ email: null, success: false, message: "Email is required" });
                    continue;
                }

                const user = await userRepository.findByEmail(email);
                if (!user) {
                    results.push({ email, success: false, message: "User not found" });
                    continue;
                }

                // Nếu permissions rỗng => xóa instructor khỏi course
                if (!Array.isArray(permissions) || permissions.length === 0) {
                    course.instructors = course.instructors.filter(
                        (inst) => inst.user._id.toString() !== user._id.toString()
                    );
                    results.push({ email, success: true, message: "Instructor removed from course" });
                    continue;
                }

                // Lọc permission hợp lệ
                const validPermissions = await Permission.find({
                    _id: { $in: permissions },
                }).select("_id");

                if (validPermissions.length === 0) {
                    results.push({ email, success: false, message: "No valid permission id found" });
                    continue;
                }

                const validIds = validPermissions.map((p) => p._id.toString());

                // Tìm instructor
                const exist = course.instructors.find((inst) => inst.user._id.toString() === user._id.toString());

                if (exist) {
                    // Thay vì merge => GHI ĐÈ permissions
                    exist.permission = validIds;
                    results.push({
                        email,
                        success: true,
                        message: "Permissions updated successfully",
                    });
                } else {
                    // Thêm instructor mới
                    course.instructors.push({
                        user: user._id,
                        isAccept: false,
                        permission: validIds,
                    });
                    results.push({
                        email,
                        success: true,
                        message: "Instructor added with permissions",
                    });
                }
            }

            await course.save();

            return {
                status: system_enum.STATUS_CODE.OK,
                message: "Assign/Update permissions completed",
                data: results,
            };
        } catch (error) {
            console.error("Assign Permission Error:", error);
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
