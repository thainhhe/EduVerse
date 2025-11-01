const Room = require("../models/RoomMeeting");

const roomMeetingRepository = {
    findAll: async () => {
        return await Room.find()
            .populate("courseId", "title")
            .populate("createdBy", "name email")
            .sort({ startTime: -1 })
            .exec();
    },

    findById: async (id) => {
        return await Room.findById(id).populate("courseId", "title").populate("createdBy", "name email").exec();
    },

    findByCourseId: async (courseId) => {
        return await Room.find({ courseId }).populate("createdBy", "name email").sort({ startTime: -1 }).exec();
    },

    findByCreator: async (userId) => {
        return await Room.find({ createdBy: userId }).populate("courseId", "title").sort({ startTime: -1 }).exec();
    },

    createRoom: async (data) => {
        return await Room.create(data);
    },

    updateRoom: async (id, update) => {
        return await Room.findByIdAndUpdate(id, update, { new: true })
            .populate("courseId", "title")
            .populate("createdBy", "name email")
            .exec();
    },

    deleteRoom: async (id) => {
        return await Room.findByIdAndDelete(id).exec();
    },

    save: async (room) => {
        return await room.save();
    },
};

module.exports = roomMeetingRepository;
