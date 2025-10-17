const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        main_instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        instructors: [
            {
                id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                permission: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
            },
        ],
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        isPublished: { type: Boolean, default: false },
        price: { type: Number, default: 0, min: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalEnrollments: { type: Number, default: 0, min: 0 },
        status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "courses",
    }
);

module.exports = mongoose.model("Course", courseSchema);
