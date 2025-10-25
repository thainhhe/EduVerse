const express = require("express");
const authRouter = require("./auth.routes");
const userRouter = require("./user.routes");
const moduleRouter = require("./module.routes");
const lessonRouter = require("./lesson.routes");
const courseRouter = require("./course.routes");

const router = express.Router();
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/modules", moduleRouter);
router.use("/lessons", lessonRouter);
router.use("/courses", courseRouter);

module.exports = router;
