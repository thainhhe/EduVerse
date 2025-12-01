const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/system/upload.middleware");
const systemController = require("../../controllers/admin/system.controller");
router.get("/settings", systemController.getSettings);
router.put("/settings", upload.single("logo"), systemController.updateSettings);

module.exports = router;
