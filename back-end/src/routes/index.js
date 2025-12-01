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
const paymentRouter = require("./payment.routes.js");
const notificationRouter = require("./notification.routes.js");

const courseManagementRouter = require("./admin/courseManagement.routes");
const dashboardRoutes = require("./admin/dashboard.routes");
const systemRouter = require("./admin/system.routes");
const ragRoutes = require("./rag.routes");
const chatHistoryRoutes = require("./chatHistory.routes");

//===============================GENERAL ROUTES=========================================================

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
// Use auth routes
router.use("/auth", authRouter);
// Use user routes
router.use("/users", userRouter);
// Use module routes
router.use("/modules", moduleRouter);
// Use lesson routes
router.use("/lessons", lessonRouter);
// Use course routes
router.use("/courses", courseRouter);
// Use forum routes
router.use("/forum", forumRouter);
// Use comment routes
router.use("/comment", commentRouter);
// Use chatbot routes
router.use("/chatbot", chatbotRouter);
router.use("/chat/history", chatHistoryRoutes);

//===============================ADMIN ROUTES=========================================================
router.use("/admin/courses", courseManagementRouter);
router.use("/admin/dashboard", dashboardRoutes);
router.use("/admin/system", systemRouter);

router.use("/logs", logRouter);

///admin

router.use("/admin/manage-user", manage_user_router);

// instructor

router.use("/instructors", instructor_dashboard_router);
router.use("/room-meeting", roomRouter);
router.use("/payment", paymentRouter);
router.use("/notifications", notificationRouter);

// RAG Routes
router.use("/rag", ragRoutes);

module.exports = router;
