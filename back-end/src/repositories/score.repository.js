const Score = require("../models/Score");
const Quiz = require("../models/Quiz");
const User = require("../models/User");

const scoreRepository = {
  getAllScores: async (filters = {}) => {
    try {
      return await Score.find(filters)
        .populate("userId", "username email avatar")
        .populate("quizId", "title description passingScore")
        .exec();
    } catch (error) {
      console.error("Repository Error - getAllScores:", error);
      throw error;
    }
  },

  getScoreById: async (id) => {
    try {
      return await Score.findById(id)
        .populate("userId", "username email avatar")
        .populate("quizId", "title description passingScore")
        .exec();
    } catch (error) {
      console.error("Repository Error - getScoreById:", error);
      throw error;
    }
  },

  getScoresByUser: async (userId) => {
    try {
      return await Score.find({ userId })
        .populate("quizId", "title description passingScore")
        .sort({ dateSubmitted: -1 })
        .exec();
    } catch (error) {
      console.error("Repository Error - getScoresByUser:", error);
      throw error;
    }
  },

  getScoresByQuiz: async (quizId) => {
    try {
      return await Score.find({ quizId })
        .populate("userId", "username email avatar")
        .sort({ percentage: -1 })
        .exec();
    } catch (error) {
      console.error("Repository Error - getScoresByQuiz:", error);
      throw error;
    }
  },

  getUserAttempts: async (userId, quizId) => {
    try {
      return await Score.find({ userId, quizId })
        .sort({ attemptNumber: -1 })
        .exec();
    } catch (error) {
      console.error("Repository Error - getUserAttempts:", error);
      throw error;
    }
  },

  createScore: async (data) => {
    try {
      const score = await Score.create(data);
      return await Score.findById(score._id)
        .populate("userId", "username email avatar")
        .populate("quizId", "title description passingScore")
        .exec();
    } catch (error) {
      console.error("Repository Error - createScore:", error);
      throw error;
    }
  },

  updateScore: async (id, data) => {
    try {
      return await Score.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
        .populate("userId", "username email avatar")
        .populate("quizId", "title description passingScore")
        .exec();
    } catch (error) {
      console.error("Repository Error - updateScore:", error);
      throw error;
    }
  },

  deleteScore: async (id) => {
    try {
      return await Score.findByIdAndDelete(id).exec();
    } catch (error) {
      console.error("Repository Error - deleteScore:", error);
      throw error;
    }
  },

  // find a single score by user and quiz, populate nested quiz scope
  getScoreByUserAndQuiz: async (userId, quizId) => {
    try {
      return await Score.findOne({ userId, quizId })
        .populate("userId", "username email avatar")
        .populate({
          path: "quizId",
          select:
            "title description questions  passingScore courseId moduleId lessonId isPublished",
          populate: [
            { path: "courseId", select: "title _id" },
            {
              path: "moduleId",
              select: "title _id courseId",
              populate: { path: "courseId", select: "title _id" },
            },
            {
              path: "lessonId",
              select: "title _id moduleId",
              populate: {
                path: "moduleId",
                select: "title _id courseId",
                populate: { path: "courseId", select: "title _id" },
              },
            },
          ],
        })
        .sort({ attemptNumber: -1 })
        .exec();
    } catch (error) {
      console.error("Repository Error - getScoreByUserAndQuiz:", error);
      throw error;
    }
  },
};

module.exports = scoreRepository;
