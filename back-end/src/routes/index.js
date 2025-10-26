const express = require("express");
// const authRouter = require("./auth.routes");
const router = express.Router();
const categoryRouter = require("./category.routes.js");
const reviewRouter = require("./review.routes.js");
const enrollRouter = require("./enroll.routes.js");
const reportRouter = require("./report.routes.js");
const favoriteRouter = require("./favorite.routes.js");
const quizRouter = require("./quiz.routes.js");
const scoreRouter = require("./score.routes.js");

// Use category routes
router.use("/category", categoryRouter);
// Use review routes
router.use("/review", reviewRouter);
// Use enrollment routes
router.use("/enrollment", enrollRouter);
// Use report routes
router.use("/report", reportRouter);
// Use favorite routes
router.use("/favorite", favoriteRouter);
// Use quiz routes
router.use("/quiz", quizRouter);
// Use score routes
router.use("/score", scoreRouter);


module.exports = router;
