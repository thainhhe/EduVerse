import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
    {
        title: { type: String },
        filename: {
            type: String,
            required: true,
            unique: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            enum: ["document", "video"],
            required: true,
        },
        mimeType: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        },
        bucket: {
            type: String,
            required: true,
        },
        uploadDate: {
            type: Date,
            default: Date.now,
        },
        duration: {
            type: Number,
        },
        thumbnailUrl: {
            type: String,
        },
        tags: [
            {
                type: String,
            },
        ],
        description: {
            type: String,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        accessLevel: {
            type: String,
            enum: ["public", "private", "restricted"],
            default: "private",
        },
        downloadCount: { type: Number, default: 0, min: 0 },
        lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson",
            default: null,
        },
        status: {
            type: String,
            enum: ["active", "deleted"],
            default: "active",
        },
    },
    {
        timestamps: true,
        collection: "files",
    }
);

fileSchema.index({ originalName: "text", description: "text", tags: "text" });

const File = mongoose.model("File", fileSchema);

export default File;
