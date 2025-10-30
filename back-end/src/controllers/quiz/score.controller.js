const scoreServices = require('../../services/score/score.service');
const { response, error_response } = require('../../utils/response.util');

const getAllScores = async (req, res) => {
    try {
        const filters = {};
        if (req.query.userId) filters.userId = req.query.userId;
        if (req.query.quizId) filters.quizId = req.query.quizId;
        if (req.query.status) filters.status = req.query.status;

        const result = await scoreServices.getAllScores(filters);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

const getScoreById = async (req, res) => {
    try {
        const scoreId = req.params.id;
        const result = await scoreServices.getScoreById(scoreId);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

const getScoresByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await scoreServices.getScoresByUser(userId);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

const getScoresByQuiz = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const result = await scoreServices.getScoresByQuiz(quizId);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

const submitQuiz = async (req, res) => {
    try {
        const submitData = req.body;
        const result = await scoreServices.submitQuiz(submitData);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

const deleteScore = async (req, res) => {
    try {
        const scoreId = req.params.id;
        const result = await scoreServices.deleteScore(scoreId);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};


module.exports = {
    getAllScores,
    getScoreById,
    getScoresByUser,
    getScoresByQuiz,
    submitQuiz,
    deleteScore,
};

