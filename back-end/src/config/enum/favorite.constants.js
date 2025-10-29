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

const favorite_enum = {
    VALIDATOR_SCHEMA: {
        // USER ID
        REQUIRED_USER_ID: "User ID is required.",

        // COURSE ID
        REQUIRED_COURSE_ID: "Course ID is required.",
    },

    FAVORITE_MESSAGE: {
        // SUCCESS
        ADD_SUCCESS: "Course added to favorites successfully.",
        REMOVE_SUCCESS: "Course removed from favorites successfully.",

        // FAIL
        FAVORITE_NOT_FOUND: "Favorite not found.",
        DUPLICATE_FAVORITE: "This course is already in your favorites.",
    },
};

module.exports = favorite_enum;