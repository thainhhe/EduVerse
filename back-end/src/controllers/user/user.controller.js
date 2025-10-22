const User = require("../../models/User");

const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const data = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                username: data.name,
                avatar: req.file ? req.file.path : data.avatar,
            },
            { new: true }
        ).select("-password");
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

module.exports = {
    getAllUsers,
    updateProfile,
    getProfile,
};
