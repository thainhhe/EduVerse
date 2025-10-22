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
        modules: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }], default: [] },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        isPublished: { type: Boolean, default: false },
        thumbnail: { type: String, default: "" },
        price: { type: Number, default: 0, min: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        time: { number: String, dateFormat: { type: String, enum: ["Day", "Month", "Year"], default: "Day" } },
        isPublished: { type: Boolean, default: false },
        totalEnrollments: { type: Number, default: 0, min: 0 },
        tags: { type: [String], default: [] },
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
