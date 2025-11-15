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

  getInstructor: async () => {
    return await User.aggregate([
      { $match: { role: "instructor" } },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "main_instructor",
          as: "courses",
          pipeline: [
            { $sort: { rating: -1 } },
            {
              $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
            },
            {
              $lookup: {
                from: "users",
                localField: "main_instructor",
                foreignField: "_id",
                as: "main_instructor",
                pipeline: [
                  {
                    $lookup: {
                      from: "permissions",
                      localField: "permissions",
                      foreignField: "_id",
                      as: "permissions",
                    },
                  },
                  {
                    $project: {
                      password: 0,
                      resetOtpHash: 0,
                      resetOtpExpires: 0,
                      resetOtpAttempts: 0,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$main_instructor",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "modules",
                localField: "_id",
                foreignField: "courseId",
                as: "modules",
                pipeline: [
                  { $sort: { order: 1, createdAt: 1 } },
                  {
                    $lookup: {
                      from: "lessons",
                      localField: "_id",
                      foreignField: "moduleId",
                      as: "lessons",
                      pipeline: [{ $sort: { order: 1, createdAt: 1 } }],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        $addFields: {
          maxRating: { $ifNull: [{ $max: "$courses.rating" }, 0] },
        },
      },
      { $sort: { maxRating: -1 } },
    ]);
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
      role: data?.role || "learner",
      subject_instructor: data.subject_instructor || "",
      job_title: data?.job_title || null,
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
