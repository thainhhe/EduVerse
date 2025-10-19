const User = require("../models/User");

const userRepository = {
  findByEmail: async (email) => {
    return await User.findOne({ email: email })
      .populate("permissions", "name")
      .exec();
  },

  findById: async (id) => {
    return await User.findById(id).select("-password").exec();
  },

  findAll: async () => {
    return await User.find().select("-password").exec();
  },

  createUser: async (data) => {
    // data.password is expected to be already hashed by service
    return await User.create({
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role || "student", // fallback role
      created_by: data.user?._id || null,
    });
  },

  updateUser: async (id, update) => {
    return await User.findByIdAndUpdate(id, update, { new: true })
      .select("-password")
      .exec();
  },

  save: async (user) => {
    return await user.save();
  },
};

// chỉ export một lần dưới dạng object
module.exports = { userRepository };
