const express = require("express");
const quizRouter = express.Router();
const quizController = require("../controllers/quiz/quiz.controller");
const { verifyToken } = require("../middlewares/auth/authMiddleware");

// new scope routes (place before '/:id' to avoid param conflict)
quizRouter.get(
  "/course/:courseId",
  verifyToken,
  quizController.getQuizzesByCourse
);
quizRouter.get(
  "/module/:moduleId",
  verifyToken,
  quizController.getQuizzesByModule
);
quizRouter.get(
  "/lesson/:lessonId",
  verifyToken,
  quizController.getQuizzesByLesson
);

quizRouter.get("/", verifyToken, quizController.getAllQuizzes);
quizRouter.get("/:id", verifyToken, quizController.getQuizById);
quizRouter.post("/", verifyToken, quizController.createQuiz);
quizRouter.put("/:id", verifyToken, quizController.updateQuiz);
quizRouter.delete("/:id", verifyToken, quizController.deleteQuiz);

module.exports = quizRouter;
