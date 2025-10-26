const Quiz = require('../models/Quiz');
const User = require('../models/User');

const quizRepository = {
    getAllQuizzes: async (filters = {}) => {
        try {
            return await Quiz.find(filters)
                .populate('createdBy', 'username email')
                .exec();
        } catch (error) {
            console.error('Repository Error - getAllQuizzes:', error);
            throw error;
        }
    },

    getQuizById: async (id) => {
        try {
            return await Quiz.findById(id)
                .populate('createdBy', 'username email')
                .exec();
        } catch (error) {
            console.error('Repository Error - getQuizById:', error);
            throw error;
        }
    },

    createQuiz: async (data) => {
        try {
            const quiz = await Quiz.create(data);
            return await Quiz.findById(quiz._id)
                .populate('createdBy', 'username email')
                .exec();
        } catch (error) {
            console.error('Repository Error - createQuiz:', error);
            throw error;
        }
    },

    updateQuiz: async (id, data) => {
        try {
            return await Quiz.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            })
                .populate('createdBy', 'username email')
                .exec();
        } catch (error) {
            console.error('Repository Error - updateQuiz:', error);
            throw error;
        }
    },

    deleteQuiz: async (id) => {
        try {
            return await Quiz.findByIdAndDelete(id).exec();
        } catch (error) {
            console.error('Repository Error - deleteQuiz:', error);
            throw error;
        }
    },
};

module.exports = quizRepository;