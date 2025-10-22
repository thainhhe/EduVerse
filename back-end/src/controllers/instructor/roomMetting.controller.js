const Room = require("../../models/RoomMeeting");

const createRoom = async (req, res) => {
    try {
        const data = req.body;
        if (!data.name || data.name.trim() === "")
            return res.status(400).json({ message: "Vui lòng điền tên phòng họp" });
        const newRoom = new Room({
            name: data.name.trim(),
            description: data.description || null,
            courseId: data.courseId || null,
            createdBy: req.userId,
            link: data.link || null,
        });
        await newRoom.save();
        return res.status(201).json(newRoom);
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        return res.status(200).json(rooms);
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

module.exports = {
    createRoom,
    getAllRooms,
};
