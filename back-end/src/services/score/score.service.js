const scoreRepository = require('../../repositories/score.repository');
const quizRepository = require('../../repositories/quiz.repository');
const scoreValidator = require('../../validator/score.validator');
const scoreHelper = require('./score.helper');

const scoreServices = {
    getAllScores: async (filters = {}) => {
        try {
            const scores = await scoreRepository.getAllScores(filters);
            return {
                status: 200,
                message: 'Success',
                data: scoreHelper.formatScores(scores),
            };
        } catch (error) {
            console.error('Service Error - getAllScores:', error);
            throw error;
        }
    },

    getScoreById: async (id) => {
        try {
            const score = await scoreRepository.getScoreById(id);

            if (!score) {
                return {
                    status: 404,
                    message: 'Score not found',
                };
            }

            return {
                status: 200,
                message: 'Success',
                data: scoreHelper.formatScore(score),
            };
        } catch (error) {
            console.error('Service Error - getScoreById:', error);
            throw error;
        }
    },

    getScoresByUser: async (userId) => {
        try {
            const scores = await scoreRepository.getScoresByUser(userId);
            return {
                status: 200,
                message: 'Success',
                data: scoreHelper.formatScores(scores),
            };
        } catch (error) {
            console.error('Service Error - getScoresByUser:', error);
            throw error;
        }
    },

    getScoresByQuiz: async (quizId) => {
        try {
            const scores = await scoreRepository.getScoresByQuiz(quizId);
            return {
                status: 200,
                message: 'Success',
                data: scoreHelper.formatScores(scores),
            };
        } catch (error) {
            console.error('Service Error - getScoresByQuiz:', error);
            throw error;
        }
    },

    submitQuiz: async (submitData) => {
        try {
            const validatedData = scoreValidator.validateSubmitQuiz(submitData);

            const quiz = await quizRepository.getQuizById(validatedData.quizId);

            if (!quiz) {
                return {
                    status: 404,
                    message: 'Quiz not found',
                };
            }

            if (!quiz.isPublished) {
                return {
                    status: 400,
                    message: 'Quiz is not published',
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
                remarks: result.status === 'passed'
                    ? 'Congratulations! You passed the quiz.'
                    : 'Keep trying! You can do better.',
            };

            const newScore = await scoreRepository.createScore(scoreData);

            return {
                status: 201,
                message: 'Quiz submitted successfully',
                data: scoreHelper.formatScore(newScore),
            };
        } catch (error) {
            console.error('Service Error - submitQuiz:', error);

            if (error.isValidation) {
                return {
                    status: 400,
                    message: 'Validation failed',
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
                    message: 'Score not found',
                };
            }

            await scoreRepository.deleteScore(id);
            return {
                status: 200,
                message: 'Score deleted successfully',
            };
        } catch (error) {
            console.error('Service Error - deleteScore:', error);
            throw error;
        }
    },
};

module.exports = scoreServices;