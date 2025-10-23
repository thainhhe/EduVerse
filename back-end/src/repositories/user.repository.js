const { ROLE } = require("../config/enum/permissions.constants");
const User = require("../models/User");

const userRepository = {
    findByEmail: async (email) => {
        return await User.findOne({ email: email }).populate("permissions", "name").exec();
    },

    findById: async (id) => {
        return await User.findById(id).select("-password").exec();
    },

    findAll: async () => {
        return await User.find().select("-password").exec();
    },

    createUser: async (data) => {
        return await User.create({
            username: data.username,
            email: data.email,
            password: data.password,
        });
    },

    updateUser: async (id, update) => {
        return await User.findByIdAndUpdate(id, update, { new: true }).select("-password").exec();
    },

    save: async (user) => {
        return await user.save();
    },
};

module.exports = userRepository;

module.exports = { userRepository };
