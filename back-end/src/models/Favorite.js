const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        addedAt: { type: Date, default: Date.now },
        materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Material" },
        type: { type: String, enum: ["course", "material"], required: true },
    },
    {
        timestamps: true,
        collection: "favorites",
    }
);

module.exports = mongoose.model("Favorite", favoriteSchema);
