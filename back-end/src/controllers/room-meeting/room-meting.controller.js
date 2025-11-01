const { roomService } = require("../../services/room-meeting/room.service");
const { error_response, response } = require("../../utils/response.util");

const room_meting_controller = {
    getAll: async (req, res) => {
        try {
            const result = await roomService.getAllRoom();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    get_room_by_courseId: async (req, res) => {
        try {
            const courseId = req.params.courseId;
            const result = await roomService.getRoomByCourseId(courseId);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    create_room: async (req, res) => {
        try {
            const data = req.body;
            const result = await roomService.createRoom(data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    update_room: async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const result = await roomService.updateRoom(id, data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    delete_room: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await roomService.deleteRoom(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { room_meting_controller };
