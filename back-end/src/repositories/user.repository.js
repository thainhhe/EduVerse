const { ROLE } = require("../config/enum/permissions.constants");
const User = require("../models/User");

const userRepository = {
  findByEmail: async (email) => {
    return await User.findOne({ email: email, status: "active" })
      .populate("permissions", "name")
      .exec();
  },

  findInstructor: async () => {
    return await User.find({ role: "instructor" })
      .populate("permissions", "name")
      .exec();
  },

  findByEmail_Duplicate: async (email) => {
    return await User.findOne({ email: email }).exec();
  },

  findDuplicateEmailExceptSelf: async (email, userId) => {
    return await User.findOne({
      email: email,
      _id: { $ne: userId },
    }).exec();
  },

  findById: async (id) => {
    return await User.findOne({ _id: id, status: "active" })
      .populate("permissions", "name")
      .select("-password")
      .exec();
  },

  findAll: async () => {
    return await User.find()
      .select("-password")
      .populate("permissions", "name")
      .exec();
  },

  create: async (data) => {
    return await User.create({
      username: data.username,
      email: data.email,
      password: data.password,
    });
  },

  update: async (id, update) => {
    return await User.findOneAndUpdate({ _id: id, status: "active" }, update, {
      new: true,
    })
      .select("-password")
      .populate("permissions", "name")
      .exec();
  },

  update_by_email: async (email, update) => {
    return await User.findOneAndUpdate(
      { email: email, status: "active" },
      update,
      { new: true }
    )
      .select("-password")
      .exec();
  },

  close: async (id) => {
    return await User.findOneAndUpdate(
      { _id: id, status: "active" },
      { status: "inactive" },
      { new: true }
    )
      .select("-password")
      .exec();
  },

  banned: async (id) => {
    return await User.findOneAndUpdate(
      { _id: id, status: "active" },
      { status: "banned" },
      { new: true }
    )
      .select("-password")
      .exec();
  },

  save: async (user) => {
    return await user.save();
  },
};

module.exports = { userRepository };
