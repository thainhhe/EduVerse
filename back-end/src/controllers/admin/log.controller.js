const Log = require("../../models/Log");

const getAllLogs = async (req, res) => {
    try {
        const logs = await Log.find();
        return res.status(200).json(logs);
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

module.exports = {
    getAllLogs,
};
