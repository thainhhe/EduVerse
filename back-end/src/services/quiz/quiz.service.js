const quizRepository = require('../../repositories/quiz.repository');
const quizValidator = require('../../validator/quiz.validator');
const quizHelper = require('./quiz.helper');

const quizServices = {
    getAllQuizzes: async (filters = {}) => {
        try {
            const quizzes = await quizRepository.getAllQuizzes(filters);
            return {
                status: 200,
                message: 'Success',
                data: quizHelper.formatQuizzes(quizzes, false),
            };
        } catch (error) {
            console.error('Service Error - getAllQuizzes:', error);
            throw error;
        }
    },

    getQuizById: async (id, includeAnswers = false) => {
        try {
            const quiz = await quizRepository.getQuizById(id);

            if (!quiz) {
                return {
                    status: 404,
                    message: 'Quiz not found',
                };
            }

            return {
                status: 200,
                message: 'Success',
                data: quizHelper.formatQuiz(quiz, includeAnswers),
            };
        } catch (error) {
            console.error('Service Error - getQuizById:', error);
            throw error;
        }
    },

    createQuiz: async (quizData) => {
        try {
            const validatedData = quizValidator.validateQuizData(quizData, false);
            const newQuiz = await quizRepository.createQuiz(validatedData);

            return {
                status: 201,
                message: 'Quiz created successfully',
                data: quizHelper.formatQuiz(newQuiz, true),
            };
        } catch (error) {
            console.error('Service Error - createQuiz:', error);

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

    updateQuiz: async (id, quizData) => {
        try {
            const validatedData = quizValidator.validateQuizData(quizData, true);

            const existingQuiz = await quizRepository.getQuizById(id);
            if (!existingQuiz) {
                return {
                    status: 404,
                    message: 'Quiz not found',
                };
            }

            const updatedQuiz = await quizRepository.updateQuiz(id, validatedData);
            return {
                status: 200,
                message: 'Quiz updated successfully',
                data: quizHelper.formatQuiz(updatedQuiz, true),
            };
        } catch (error) {
            console.error('Service Error - updateQuiz:', error);

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

    deleteQuiz: async (id) => {
        try {
            const existingQuiz = await quizRepository.getQuizById(id);
            if (!existingQuiz) {
                return {
                    status: 404,
                    message: 'Quiz not found',
                };
            }

            await quizRepository.deleteQuiz(id);
            return {
                status: 200,
                message: 'Quiz deleted successfully',
            };
        } catch (error) {
            console.error('Service Error - deleteQuiz:', error);
            throw error;
        }
    },
};

module.exports = quizServices;
