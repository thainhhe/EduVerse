const quizServices = require("../../services/quiz/quiz.service");
const { response, error_response } = require("../../utils/response.util");

// Get all quizzes
const getAllQuizzes = async (req, res) => {
  try {
    const filters = {};
    if (req.query.isPublished)
      filters.isPublished = req.query.isPublished === "true";

    const result = await quizServices.getAllQuizzes(filters);
    return response(res, result);
  } catch (error) {
    return error_response(res, error);
  }
};

// Get quiz by ID
const getQuizById = async (req, res) => {
  try {
    const quizId = req.params.id;
    const includeAnswers = req.query.includeAnswers === "true";

    const result = await quizServices.getQuizById(quizId, includeAnswers);
    return response(res, result);
  } catch (error) {
    return error_response(res, error);
  }
};

// Create quiz
const createQuiz = async (req, res) => {
  try {
    const quizData = { ...(req.body || {}) };
    // if authentication middleware sets req.user, persist who created the quiz
    if (req.user && (req.user._id || req.user.id)) {
      quizData.createdBy = req.user._id ?? req.user.id;
    }
    const result = await quizServices.createQuiz(quizData);
    return response(res, result);
  } catch (error) {
    return error_response(res, error);
  }
};

// Update quiz
const updateQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quizData = req.body;
    const result = await quizServices.updateQuiz(quizId, quizData);
    return response(res, result);
  } catch (error) {
    return error_response(res, error);
  }
};

// Delete quiz
const deleteQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const result = await quizServices.deleteQuiz(quizId);
    return response(res, result);
  } catch (error) {
    return error_response(res, error);
  }
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};
