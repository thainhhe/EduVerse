const User = require("../models/User");

const userRepository = {
    async findByEmail(email) {
        return await User.findOne({ email }).exec();
    },
    async findById(id) {
        return await User.findById(id).select("-password").exec();
    },
    async findAll() {
        return await User.find().select("-password").exec();
    },
    async createUser(data) {
        return await User.create(data);
    },
    async updateUser(id, update) {
        return await User.findByIdAndUpdate(id, update, { new: true }).select("-password").exec();
    },
    async save(user) {
        return await user.save();
    },
};

module.exports = { userRepository };
