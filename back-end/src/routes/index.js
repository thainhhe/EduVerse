const express = require("express");
const categoryRouter = require("./category.routes.js");
const reviewRouter = require("./review.routes.js");
const enrollRouter = require("./enroll.routes.js");
const reportRouter = require("./report.routes.js");
const favoriteRouter = require("./favorite.routes.js");
const quizRouter = require("./quiz.routes.js");
const scoreRouter = require("./score.routes.js");
const authRouter = require("./auth.routes");
const userRouter = require("./user.routes");
const moduleRouter = require("./module.routes");
const lessonRouter = require("./lesson.routes");
const courseRouter = require("./course.routes");
const forumRouter = require("./forum.routes");
const commentRouter = require("./comment.routes");
const chatbotRouter = require("./chatbot.routes");
const router = express.Router();
const materialRouter = require("./material.routes");
const logRouter = require("./log.routes.js");
const manage_user_router = require("./admin/manage-user.routes.js");
const instructor_dashboard_router = require("./instructor/instructor-dashboard.routes.js");
const roomRouter = require("./room-meeting.routes.js");

// Use material routes
router.use("/material", materialRouter);

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

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/modules", moduleRouter);
router.use("/lessons", lessonRouter);
router.use("/courses", courseRouter);
router.use("/logs", logRouter);

///admin

router.use("/admin/manage-user", manage_user_router);

// instructor

router.use("/instructors", instructor_dashboard_router);
router.use("/room-meeting", roomRouter);

module.exports = router;
