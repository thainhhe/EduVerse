const scoreRepository = require("../../repositories/score.repository");
const quizRepository = require("../../repositories/quiz.repository");
const scoreValidator = require("../../validator/score.validator");
const scoreHelper = require("./score.helper");

const scoreServices = {
  getAllScores: async (filters = {}) => {
    try {
      const scores = await scoreRepository.getAllScores(filters);
      return {
        status: 200,
        message: "Success",
        data: scoreHelper.formatScores(scores),
      };
    } catch (error) {
      console.error("Service Error - getAllScores:", error);
      throw error;
    }
  },

  getScoreById: async (id) => {
    try {
      const score = await scoreRepository.getScoreById(id);

      if (!score) {
        return {
          status: 404,
          message: "Score not found",
        };
      }

      return {
        status: 200,
        message: "Success",
        data: scoreHelper.formatScore(score),
      };
    } catch (error) {
      console.error("Service Error - getScoreById:", error);
      throw error;
    }
  },

  getScoresByUser: async (userId) => {
    try {
      const scores = await scoreRepository.getScoresByUser(userId);
      return {
        status: 200,
        message: "Success",
        data: scoreHelper.formatScores(scores),
      };
    } catch (error) {
      console.error("Service Error - getScoresByUser:", error);
      throw error;
    }
  },

  getScoresByQuiz: async (quizId) => {
    try {
      const scores = await scoreRepository.getScoresByQuiz(quizId);
      return {
        status: 200,
        message: "Success",
        data: scoreHelper.formatScores(scores),
      };
    } catch (error) {
      console.error("Service Error - getScoresByQuiz:", error);
      throw error;
    }
  },

  submitQuiz: async (submitData) => {
    try {
      const validatedData = scoreValidator.validateSubmitQuiz(submitData);
      console.log("validatedData", validatedData);
      const quiz = await quizRepository.getQuizById(validatedData.quizId);

      if (!quiz) {
        return {
          status: 404,
          message: "Quiz not found",
        };
      }

      if (!quiz.isPublished) {
        return {
          status: 400,
          message: "Quiz is not published",
        };
      }

      const previousAttempts = await scoreRepository.getUserAttempts(
        validatedData.userId,
        validatedData.quizId
      );

      if (previousAttempts.length >= quiz.attemptsAllowed) {
        return {
          status: 400,
          message: `Maximum attempts (${quiz.attemptsAllowed}) reached`,
        };
      }

      const result = scoreHelper.calculateScore(quiz, validatedData.answers);
      console.log("result", result);
      const scoreData = {
        userId: validatedData.userId,
        quizId: validatedData.quizId,
        score: result.score,
        totalPoints: result.totalPoints,
        percentage: result.percentage,
        answers: result.answers,
        timeTaken: validatedData.timeTaken,
        attemptNumber: previousAttempts.length + 1,
        status: result.status,
        remarks:
          result.status === "passed"
            ? "Congratulations! You passed the quiz."
            : "Keep trying! You can do better.",
      };

      const newScore = await scoreRepository.createScore(scoreData);

      return {
        status: 201,
        message: "Quiz submitted successfully",
        data: scoreHelper.formatScore(newScore),
      };
    } catch (error) {
      console.error("Service Error - submitQuiz:", error);

      if (error.isValidation) {
        return {
          status: 400,
          message: "Validation failed",
          errors: error.validationErrors,
        };
      }

      throw error;
    }
  },

  deleteScore: async (id) => {
    try {
      const existingScore = await scoreRepository.getScoreById(id);
      if (!existingScore) {
        return {
          status: 404,
          message: "Score not found",
        };
      }

      await scoreRepository.deleteScore(id);
      return {
        status: 200,
        message: "Score deleted successfully",
      };
    } catch (error) {
      console.error("Service Error - deleteScore:", error);
      throw error;
    }
  },

  // get a user's score for a specific quiz with scope information
  getUserQuizScore: async (userId, quizId) => {
    try {
      const score = await scoreRepository.getScoreByUserAndQuiz(userId, quizId);

      if (!score) {
        return {
          status: 404,
          message: "Score not found for this user and quiz",
        };
      }
      console.log("score", score);
      const quiz = score.quizId || {};
      const questions = quiz?.questions || [];
      console.log("questions", questions);
      const detailedAnswers = score.answers.map((ans) => {
        const question = questions.find(
          (q) => q._id.toString() === ans.questionId.toString()
        );

        return {
          ...(ans.toObject?.() || ans),
          question: question
            ? {
                questionText: question.questionText,
                questionType: question.questionType,
                options: question.options,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
                points: question.points,
                order: question.order,
              }
            : null,
        };
      });

      console.log("detailedAnswers", detailedAnswers);
      const formatted = {
        ...scoreHelper.formatScore(score),
        answers: detailedAnswers,
      };

      const scope = {};

      // If quiz has lessonId populated and that lesson has module/course populated
      if (quiz.lessonId) {
        const lesson = typeof quiz.lessonId === "object" ? quiz.lessonId : null;
        const moduleFromLesson = lesson?.moduleId || null;
        const courseFromLesson = moduleFromLesson?.courseId || null;

        scope.type = "lesson";
        scope.lesson = lesson
          ? { id: lesson._id?.toString() || lesson.id, title: lesson.title }
          : { id: quiz.lessonId?.toString?.() || quiz.lessonId, title: null };
        scope.module = moduleFromLesson
          ? {
              id: moduleFromLesson._id?.toString() || moduleFromLesson.id,
              title: moduleFromLesson.title,
            }
          : quiz.moduleId
          ? {
              id: quiz.moduleId._id?.toString() || quiz.moduleId,
              title: quiz.moduleId?.title || null,
            }
          : null;
        scope.course = courseFromLesson
          ? {
              id: courseFromLesson._id?.toString() || courseFromLesson.id,
              title: courseFromLesson.title,
            }
          : quiz.courseId
          ? {
              id: quiz.courseId._id?.toString() || quiz.courseId,
              title: quiz.courseId?.title || null,
            }
          : null;
      }
      // If quiz has moduleId (and no lesson)
      else if (quiz.moduleId) {
        const module = typeof quiz.moduleId === "object" ? quiz.moduleId : null;
        const courseFromModule = module?.courseId || quiz.courseId || null;

        scope.type = "module";
        scope.module = module
          ? { id: module._id?.toString() || module.id, title: module.title }
          : { id: quiz.moduleId?.toString?.() || quiz.moduleId, title: null };
        scope.course = courseFromModule
          ? {
              id: courseFromModule._id?.toString() || courseFromModule.id,
              title: courseFromModule.title,
            }
          : quiz.courseId
          ? {
              id: quiz.courseId._id?.toString() || quiz.courseId,
              title: quiz.courseId?.title || null,
            }
          : null;
      }
      // If quiz has courseId only
      else if (quiz.courseId) {
        const course = typeof quiz.courseId === "object" ? quiz.courseId : null;
        scope.type = "course";
        scope.course = course
          ? { id: course._id?.toString() || course.id, title: course.title }
          : { id: quiz.courseId?.toString?.() || quiz.courseId, title: null };
      } else {
        scope.type = "global";
      }

      return {
        status: 200,
        message: "Success",
        data: {
          score: formatted,
          quiz: {
            id: quiz._id?.toString() || quiz.id || quizId,
            title: quiz.title || null,
          },
          scope,
        },
      };
    } catch (error) {
      console.error("Service Error - getUserQuizScore:", error);
      throw error;
    }
  },

  checkQuizCompletion: async (userId, quizId) => {
    try {
      // Lấy thông tin quiz
      const quiz = await quizRepository.getQuizById(quizId);

      if (!quiz) {
        return {
          status: 404,
          message: "Quiz not found",
        };
      }

      // Lấy tất cả attempts của user cho quiz này
      const attempts = await scoreRepository.getUserAttempts(userId, quizId);

      // Kiểm tra xem đã làm chưa
      const hasCompleted = attempts.length > 0;

      // Tính toán thông tin
      const attemptsUsed = attempts.length;
      const attemptsRemaining = quiz.attemptsAllowed - attemptsUsed;
      const canRetake = attemptsUsed < quiz.attemptsAllowed;

      // Lấy attempt gần nhất (attemptNumber lớn nhất)
      let latestAttempt = null;
      if (hasCompleted) {
        latestAttempt = attempts.reduce((latest, current) => {
          return current.attemptNumber > latest.attemptNumber
            ? current
            : latest;
        }, attempts[0]);
      }

      return {
        status: 200,
        message: "Success",
        data: {
          hasCompleted,
          quiz: {
            id: quiz._id,
            title: quiz.title,
            passingScore: quiz.passingScore,
            attemptsAllowed: quiz.attemptsAllowed,
          },
          attempts: {
            total: attemptsUsed,
            remaining: attemptsRemaining,
            canRetake,
          },
          latestScore: latestAttempt
            ? {
                id: latestAttempt._id,
                score: latestAttempt.score,
                totalPoints: latestAttempt.totalPoints,
                percentage: latestAttempt.percentage,
                status: latestAttempt.status,
                attemptNumber: latestAttempt.attemptNumber,
                dateSubmitted: latestAttempt.dateSubmitted,
                passed: latestAttempt.status === "passed",
              }
            : null,
        },
      };
    } catch (error) {
      console.error("Service Error - checkQuizCompletion:", error);
      throw error;
    }
  },
};

module.exports = scoreServices;
