const Favorite = require('../models/Favorite');
// const favoriteSchema = new mongoose.Schema(
//     {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//         courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
//         addedAt: { type: Date, default: Date.now },
//         updatedAt: { type: Date, default: Date.now },
//     },
//     {
//         timestamps: true,
//         collection: "favorites",
//     }
// );

const favoriteRepository = {
    getAllFavorites: async () => {
        return await Favorite.find().populate('userId').populate('courseId').exec();
    },

    getFavoriteById: async (id) => {
        return await Favorite.findById(id).populate('userId').populate('courseId').exec();
    },

    getFavoriteByUser: async (userId) => {
        return await Favorite.find({ userId }).populate('userId').populate('courseId').exec();
    },

    createFavorite: async (data) => {
        const favorite = new Favorite(data);
        return await favorite.save();
    },

    deleteFavorite: async (id) => {
        return await Favorite.findByIdAndDelete(id).exec();
    },

    save: async (data) => {
        return data.save();
    },
};

module.exports = favoriteRepository;