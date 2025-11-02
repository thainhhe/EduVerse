const express = require("express");
const scoreRouter = express.Router();
const scoreController = require("../controllers/quiz/score.controller");
const { verifyToken } = require("../middlewares/auth/authMiddleware");

scoreRouter.get("/", verifyToken, scoreController.getAllScores);

// get score for a user in a specific quiz
scoreRouter.get(
  "/user/:userId/quiz/:quizId",
  verifyToken,
  scoreController.getUserQuizScore
);

scoreRouter.get("/:id", verifyToken, scoreController.getScoreById);
scoreRouter.get("/user/:userId", verifyToken, scoreController.getScoresByUser);
scoreRouter.get("/quiz/:quizId", verifyToken, scoreController.getScoresByQuiz);
scoreRouter.post("/submit", verifyToken, scoreController.submitQuiz);
scoreRouter.delete("/:id", verifyToken, scoreController.deleteScore);
scoreRouter.get("/check/:userId/quiz/:quizId", verifyToken, scoreController.checkQuizCompletion);


module.exports = scoreRouter;
