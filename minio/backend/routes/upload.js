import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import minioClient from "../config/minio.js";
import File from "../models/File.js";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
    },
});

// Upload document
router.post("/document", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const data = JSON.parse(req.body.data);

        console.log("Upload document", data);

        const fileExtension = req.file.originalname.split(".").pop();
        const filename = `${uuidv4()}.${fileExtension}`;
        const bucket = process.env.MINIO_DOCUMENTS_BUCKET;

        // Upload to MinIO
        await minioClient.putObject(bucket, filename, req.file.buffer, req.file.size, {
            "Content-Type": req.file.mimetype,
        });

        // Decode filename properly for UTF-8 (Vietnamese characters)
        const originalName = Buffer.from(req.file.originalname, "latin1").toString("utf8");

        // Save metadata to MongoDB
        const fileDoc = new File({
            title: data.title,
            description: data.description,
            tags: data.tags,
            accessLevel: data.accessLevel,
            lessonId: data.lessonId,
            uploadedBy: data.uploadedBy,
            filename,
            originalName,
            fileType: "document",
            mimeType: req.file.mimetype,
            size: req.file.size,
            bucket,
        });

        await fileDoc.save();

        res.status(201).json({
            message: "Document uploaded successfully",
            file: fileDoc,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Failed to upload document" });
    }
});

// Upload video
router.post("/video", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const data = JSON.parse(req.body.data);
        const { title, description, tags, accessLevel, lessonId, uploadedBy } = data;

        const fileExtension = req.file.originalname.split(".").pop();
        const filename = `${uuidv4()}.${fileExtension}`;
        const bucket = process.env.MINIO_VIDEOS_BUCKET;

        // Upload to MinIO
        await minioClient.putObject(bucket, filename, req.file.buffer, req.file.size, {
            "Content-Type": req.file.mimetype,
        });

        // Decode filename properly for UTF-8 (Vietnamese characters)
        const originalName = Buffer.from(req.file.originalname, "latin1").toString("utf8");

        // Save metadata to MongoDB
        const fileDoc = new File({
            title,
            description,
            tags,
            accessLevel,
            lessonId,
            uploadedBy,
            filename,
            originalName,
            fileType: "video",
            mimeType: req.file.mimetype,
            size: req.file.size,
            bucket,
        });

        await fileDoc.save();

        res.status(201).json({
            message: "Video uploaded successfully",
            file: fileDoc,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Failed to upload video" });
    }
});

export default router;
