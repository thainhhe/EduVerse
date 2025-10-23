const express = require("express");
const authRouter = require("./auth.routes");
const router = express.Router();
const categoryRouter = require("./category.routes.js");
const reviewRouter = require("./review.routes.js");
const enrollRouter = require("./enroll.routes.js");

// Use category routes
router.use("/categories", categoryRouter);
// Use review routes
router.use("/reviews", reviewRouter);
// Use enrollment routes
router.use("/enrollments", enrollRouter);

router.use("/users", userRouter);
router.use("/auth-google", googleRouter);
router.use("/permissions", permissionRouter);
router.use("/logs", logRouter);
router.use("/auth", authRouter);

module.exports = router;
