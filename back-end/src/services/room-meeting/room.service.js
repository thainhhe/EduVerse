const { system_enum } = require("../../config/enum/system.constant");
const roomMeetingRepository = require("../../repositories/room-meeting.repository");
const crypto = require("crypto");

const roomService = {
    getAllRoom: async () => {
        try {
            const result = await roomMeetingRepository.findAll();
            if (!result)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.FAIL_GET_DATA,
                };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    getRoomByCourseId: async (id) => {
        try {
            if (!id)
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: system_enum.SYSTEM_MESSAGE.INVALID_INPUT,
                };
            const result = await roomMeetingRepository.findByCourseId(id);
            if (!result)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.NOT_FOUND,
                };
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    createRoom: async (data) => {
        try {
            const {
                courseId,
                createdBy,
                name,
                description,
                link,
                isPublic,
                password,
                status,
                startTime,
                endTime,
            } = data;

            if (!courseId || !createdBy || !name) {
                return {
                    status: system_enum.STATUS_CODE.BAD_REQUEST,
                    message: system_enum.SYSTEM_MESSAGE.INVALID_INPUT,
                };
            }
            const randomSuffix = crypto.randomBytes(4).toString("hex");
            const roomName = `${name.replace(/\s+/g, "_")}_${randomSuffix}`;
            const meetingLink = `https://localhost:8443/${roomName}`;

            const defaultStart = new Date();
            defaultStart.setDate(defaultStart.getDate() + 3);

            const roomData = {
                name,
                courseId,
                createdBy,
                description,
                isPublic,
                password,
                status,
                link: meetingLink ?? link,
                startTime: startTime === "" ? defaultStart : new Date(startTime),
                endTime: new Date(endTime) || null,
            };
            const result = await roomMeetingRepository.createRoom(roomData);
            return {
                status: system_enum.STATUS_CODE.CREATED,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    updateRoom: async (id, data) => {
        try {
            if (!id)
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: system_enum.SYSTEM_MESSAGE.INVALID_INPUT,
                };
            const result = await roomMeetingRepository.updateRoom(id, data);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: result,
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    deleteRoom: async (id) => {
        try {
            if (!id)
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: system_enum.SYSTEM_MESSAGE.INVALID_INPUT,
                };
            const result = await roomMeetingRepository.deleteRoom(id);
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

module.exports = { roomService };
