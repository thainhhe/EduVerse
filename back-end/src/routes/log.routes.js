const express = require("express");
const { getAllLogs } = require("../controllers/log.controller");
const { verifyToken } = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionMiddleware");
const { ROLE, PERMISSIONS } = require("../config/permissions.constants");

const logRouter = express.Router();
logRouter.get("/", verifyToken, checkPermission([ROLE.ADMIN], [PERMISSIONS.VIEW_LOGS]), getAllLogs);
module.exports = logRouter;
