const chatService = require("../../services/chatbot/chatHistory.service");

async function postMessage(req, res) {
  try {
    const userId = (req.user && req.user._id) || req.body.userId;
    const { sender, message } = req.body;
    if (!userId || !sender || !message) {
      return res
        .status(400)
        .json({
          success: false,
          message: "userId, sender, message are required",
        });
    }
    const result = await chatService.addMessage(userId, sender, message);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("postMessage error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

async function getHistory(req, res) {
  try {
    const userId = req.params.userId || (req.user && req.user._id);
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "userId required" });
    const result = await chatService.getHistory(userId);
    return res.json({
      success: true,
      data: result || { userId, messages: [] },
    });
  } catch (err) {
    console.error("getHistory error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

async function clearHistory(req, res) {
  try {
    const userId = req.params.userId;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "userId required" });
    const result = await chatService.clearHistory(userId);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("clearHistory error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

async function deleteHistory(req, res) {
  try {
    const userId = req.params.userId;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "userId required" });
    const result = await chatService.deleteHistory(userId);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("deleteHistory error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

async function listHistories(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;
    const search = req.query.search;
    const result = await chatService.listHistories({ limit, skip, search });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("listHistories error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  postMessage,
  getHistory,
  clearHistory,
  deleteHistory,
  listHistories,
};
