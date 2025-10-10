const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String },
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "categories",
    }
);

module.exports = mongoose.model("Category", categorySchema);
