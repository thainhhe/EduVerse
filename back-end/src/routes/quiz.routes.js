const express = require('express');
const quizRouter = express.Router();
const quizController = require('../controllers/quiz/quiz.controller');
const { verifyToken } = require('../middlewares/auth/authMiddleware');

quizRouter.get('/', verifyToken, quizController.getAllQuizzes);
quizRouter.get('/:id', verifyToken, quizController.getQuizById);
quizRouter.post('/', verifyToken, quizController.createQuiz);
quizRouter.put('/:id', verifyToken, quizController.updateQuiz);
quizRouter.delete('/:id', verifyToken, quizController.deleteQuiz);

module.exports = quizRouter;