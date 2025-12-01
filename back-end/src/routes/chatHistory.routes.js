const express = require("express");
const router = express.Router();
const controller = require("../controllers/chatbot/chatHistory.controller");

// optional middlewares (uncomment if available)
// const { requireAuth, requireAdmin } = require("../middlewares/auth");

router.post("/", /* requireAuth, */ controller.postMessage); // add message (used by bot/user)
router.get("/:userId", /* requireAuth, */ controller.getHistory); // get specific user history
router.post(
  "/:userId/clear",
  /* requireAuth, requireAdmin, */ controller.clearHistory
); // admin clear messages
router.delete(
  "/:userId",
  /* requireAuth, requireAdmin, */ controller.deleteHistory
); // admin delete record
router.get("/", /* requireAuth, requireAdmin, */ controller.listHistories); // admin list all histories (pagination + search)

module.exports = router;
