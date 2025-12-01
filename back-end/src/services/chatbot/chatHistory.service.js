const chatRepo = require("../../repositories/chatHistory.repository");

function buildMessage(sender, message) {
  return {
    sender,
    message,
    timestamp: new Date(),
  };
}

async function addMessage(userId, sender, message) {
  const msg = buildMessage(sender, message);
  return chatRepo.upsertAddMessage(userId, msg);
}

async function getHistory(userId) {
  return chatRepo.getByUserId(userId);
}

async function clearHistory(userId) {
  return chatRepo.clearByUserId(userId);
}

async function deleteHistory(userId) {
  return chatRepo.deleteByUserId(userId);
}

async function listHistories({ limit = 50, skip = 0, search } = {}) {
  return chatRepo.listAll({ limit, skip, search });
}

module.exports = {
  addMessage,
  getHistory,
  clearHistory,
  deleteHistory,
  listHistories,
};
