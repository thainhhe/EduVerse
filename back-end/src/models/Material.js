const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        url: { type: String, required: true },
        type: { type: String, enum: ["document", "video", "link"], default: "document" },

        // Google Drive specific fields
        fileId: { type: String }, // Google Drive file ID
        fileName: { type: String }, // Original file name
        fileSize: { type: Number }, // File size in bytes
        mimeType: { type: String }, // MIME type

        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        uploadedAt: { type: Date, default: Date.now },
        accessLevel: { type: String, enum: ["public", "private", "restricted"], default: "private" },
        downloadCount: { type: Number, default: 0, min: 0 },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "materials",
    }
);

module.exports = mongoose.model("Material", materialSchema);