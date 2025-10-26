const { system_enum } = require('../../config/enum/system.constant');
const favorite_enum = require('../../config/enum/favorite.constants');
const favoriteRepository = require('../../repositories/favorite.repository');
const favoriteValidator = require('../../validator/favorite.validator');
const favoriteHelper = require('./favorite.helper');

const favoriteServices = {
    getAllFavorites: async () => {
        try {
            const favorites = await favoriteRepository.getAllFavorites();
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: favorites.map(favorite => favoriteHelper.formatFavoriteResponse(favorite)),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    getFavoriteById: async (id) => {
        try {
            const favorite = await favoriteRepository.getFavoriteById(id);

            if (!favorite) {
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: favorite_enum.FAVORITE_MESSAGE.FAVORITE_NOT_FOUND,
                };
            }

            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: favoriteHelper.formatFavoriteResponse(favorite),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    getFavoriteByUserId: async (userId) => {
        try {
            const favorites = await favoriteRepository.getFavoriteByUser(userId);

            if (!favorites || favorites.length === 0) {
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: favorite_enum.FAVORITE_MESSAGE.FAVORITE_NOT_FOUND,
                };
            }

            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: favorites.map(favorite => favoriteHelper.formatFavoriteResponse(favorite)),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    addFavorite: async (favoriteData) => {
        try {
            const validatedData = favoriteValidator.validateFavoriteData(favoriteData, false);

            // Check  duplicate favorite
            const existingFavorites = await favoriteRepository.getFavoriteByUser(validatedData.userId);

            if (existingFavorites && existingFavorites.length > 0) {
                const isDuplicate = existingFavorites.some(fav => {
                    const existingCourseId = fav.courseId._id
                        ? fav.courseId._id.toString()
                        : fav.courseId.toString();
                    return existingCourseId === validatedData.courseId.toString();
                });

                if (isDuplicate) {
                    return {
                        status: system_enum.STATUS_CODE.BAD_REQUEST,
                        message: favorite_enum.FAVORITE_MESSAGE.DUPLICATE_FAVORITE,
                    };
                }
            }

            const newFavorite = await favoriteRepository.createFavorite(validatedData);

            return {
                status: system_enum.STATUS_CODE.CREATED,
                message: favorite_enum.FAVORITE_MESSAGE.ADD_SUCCESS,
                data: favoriteHelper.formatFavoriteResponse(newFavorite),
            };
        } catch (error) {
            console.error('Error in addFavorite:', error);
            throw error;
        }
    },

    removeFavorite: async (id) => {
        try {
            console.log('=== DEBUG REMOVE FAVORITE ===');
            console.log('Favorite ID to delete:', id);

            const existingFavorite = await favoriteRepository.getFavoriteById(id);
            console.log('Existing Favorite:', existingFavorite);

            if (!existingFavorite) {
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: favorite_enum.FAVORITE_MESSAGE.FAVORITE_NOT_FOUND,
                };
            }

            await favoriteRepository.deleteFavorite(id);

            return {
                status: system_enum.STATUS_CODE.OK,
                message: favorite_enum.FAVORITE_MESSAGE.REMOVE_SUCCESS,
            };
        } catch (error) {
            console.error('Error in removeFavorite:', error);
            throw error;
        }
    },
};

module.exports = favoriteServices;