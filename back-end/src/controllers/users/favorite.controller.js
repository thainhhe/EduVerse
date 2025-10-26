const favoriteServices = require('../../services/favorite/favorite.services');
const { response, error_response } = require('../../utils/response.util');

const getAllFavorites = async (req, res) => {
    try {
        const result = await favoriteServices.getAllFavorites();
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

const getFavoriteById = async (req, res) => {
    try {
        const favoriteId = req.params.id;
        const result = await favoriteServices.getFavoriteById(favoriteId);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

const getFavoriteByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await favoriteServices.getFavoriteByUserId(userId);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

const addFavorite = async (req, res) => {
    try {
        const favoriteData = req.body;
        const result = await favoriteServices.addFavorite(favoriteData);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

const removeFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await favoriteServices.removeFavorite(id);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

module.exports = {
    getAllFavorites,
    getFavoriteById,
    getFavoriteByUserId,
    addFavorite,
    removeFavorite,
};