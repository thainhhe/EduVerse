const ChatHistory = require("../models/ChatHistory");

async function getByUserId(userId) {
  return ChatHistory.findOne({ userId }).lean();
}

async function upsertAddMessage(userId, message) {
  return ChatHistory.findOneAndUpdate(
    { userId },
    { $push: { messages: message } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function clearByUserId(userId) {
  return ChatHistory.findOneAndUpdate(
    { userId },
    { $set: { messages: [] } },
    { new: true }
  );
}

async function deleteByUserId(userId) {
  return ChatHistory.findOneAndDelete({ userId });
}

async function listAll({ limit = 50, skip = 0, search } = {}) {
  // Use aggregation to lookup user and allow searching by username/message/userId string
  const pipeline = [];

  // join users
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
    },
  });
  pipeline.push({
    $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
  });

  if (search) {
    const regex = new RegExp(search, "i");
    pipeline.push({
      $match: {
        $or: [
          { "messages.message": { $regex: regex } },
          { "user.username": { $regex: regex } },
          // match userId string if passed
          { $expr: { $eq: [{ $toString: "$userId" }, String(search)] } },
        ],
      },
    });
  }

  pipeline.push({ $sort: { updatedAt: -1 } });
  pipeline.push({ $skip: parseInt(skip || 0, 10) });
  pipeline.push({ $limit: parseInt(limit || 50, 10) });

  return ChatHistory.aggregate(pipeline).exec();
}

module.exports = {
  getByUserId,
  upsertAddMessage,
  clearByUserId,
  deleteByUserId,
  listAll,
};
