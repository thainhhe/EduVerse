const express = require("express");
const authRouter = require("./auth.routes");
const forumRouter = require("./forum.routes");
const commentRouter = require("./comment.routes");
const router = express.Router();
router.use("/auth", authRouter);
router.use("/forum", forumRouter);
router.use("/comment", commentRouter);
module.exports = router;
