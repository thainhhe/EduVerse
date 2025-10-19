const express = require("express");
const googleRouter = require("./googleAuth");
const userRouter = require("./user.routes");
const permissionRouter = require("./permission.routes");
const router = express.Router();

router.use("/users", userRouter);
router.use("/auth-google", googleRouter);
router.use("/permissions", permissionRouter);

module.exports = router;
