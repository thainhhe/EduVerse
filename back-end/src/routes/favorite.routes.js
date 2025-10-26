const express = require('express');
const favoriteController = require('../controllers/users/favorite.controller');
const { verifyToken } = require('../middlewares/auth/authMiddleware');
const favoriteRouter = express.Router();

// get all favorites
favoriteRouter.get('/', verifyToken, favoriteController.getAllFavorites);
// get favorite by id
favoriteRouter.get('/:id', verifyToken, favoriteController.getFavoriteById);
// get favorite by user id
favoriteRouter.get('/user/:userId', verifyToken, favoriteController.getFavoriteByUserId);
// add favorite
favoriteRouter.post('/', verifyToken, favoriteController.addFavorite);
// remove favorite
favoriteRouter.delete('/:id', verifyToken, favoriteController.removeFavorite);

module.exports = favoriteRouter;
