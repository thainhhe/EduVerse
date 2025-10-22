const express = require("express");
const googleRouter = require("./googleAuth");
const userRouter = require("./user.routes");
const permissionRouter = require("./permission.routes");
const logRouter = require("./log.routes");
const router = express.Router();

router.use("/users", userRouter);
router.use("/auth-google", googleRouter);
router.use("/permissions", permissionRouter);
router.use("/logs", logRouter);

module.exports = router;
