const favoriteHelper = {
    formatFavoriteResponse(favorite) {
        return {
            id: favorite._id,
            userId: favorite.userId,
            userName: favorite.userId ? favorite.userId.name : null,
            courseId: favorite.courseId,
            courseTitle: favorite.courseId ? favorite.courseId.title : null,
            addedAt: favorite.addedAt,
            updatedAt: favorite.updatedAt,
        };
    },
};

module.exports = favoriteHelper;