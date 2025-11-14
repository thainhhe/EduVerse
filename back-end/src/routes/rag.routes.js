// src/routes/rag.routes.js
const express = require("express");
const router = express.Router();
const ragController = require("../controllers/rag/rag.controller");
const {
  requireInternalAPIKey,
} = require("../middlewares/auth/ragAuthMiddleware");

/**
 * @route   GET /api/v1/rag/sync-data
 * @desc    Lấy tất cả dữ liệu đã được xử lý để đồng bộ RAG.
 * @access  Private (Internal Service)
 */
router.get("/sync-data", requireInternalAPIKey, ragController.getRagSyncData);

module.exports = router;
