const mongoose = require("mongoose");
const User = require("./User");
const Permission = require("./Permission");
const Category = require("./Category");

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        main_instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        instructors: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                isAccept: { type: Boolean, default: false },
                permission: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
            },
        ],
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
        thumbnail: { type: String, default: "" },
        price: { type: Number, default: 0, min: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        duration: {
            value: { type: Number, default: 0 },
            unit: { type: String, enum: ["day", "month", "year"], default: "day" },
        },
        isPublished: { type: Boolean, default: false },
        totalEnrollments: { type: Number, default: 0, min: 0 },
        status: { type: String, enum: ["draft", "pending", "approve", "reject"], default: "draft" },
        reasonReject: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        collection: "courses",
    }
);

module.exports = mongoose.model("Course", courseSchema);
