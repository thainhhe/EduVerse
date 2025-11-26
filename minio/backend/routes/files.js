import express from "express";
import minioClient from "../config/minio.js";
import File from "../models/File.js";

const router = express.Router();

// Get all files
router.get("/", async (req, res) => {
    try {
        const files = await File.find().sort({ uploadDate: -1 });
        res.json(files);
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ error: "Failed to fetch files" });
    }
});

router.get("/lesson/:lessonId", async (req, res) => {
    try {
        const { lessonId } = req.params;

        // Check if lessonId is "null" string or invalid ObjectId
        if (!lessonId || lessonId === "null" || lessonId === "undefined") {
            return res.json([]);
        }

        const files = await File.find({ lessonId }).sort({ uploadDate: -1 });
        res.json(files);
    } catch (error) {
        // If it's a CastError (invalid ObjectId), just return empty array
        if (error.name === "CastError") {
            return res.json([]);
        }
        console.error("Error fetching files:", error);
        res.status(500).json({ error: "Failed to fetch files" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        res.json(file);
    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).json({ error: "Failed to fetch file" });
    }
});

// Search files
router.get("/search", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: "Search query required" });
        }

        const files = await File.find({
            $text: { $search: q },
        }).sort({ uploadDate: -1 });

        res.json(files);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

// Delete file
router.delete("/:id", async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }

        // Delete from MinIO
        await minioClient.removeObject(file.bucket, file.filename);

        // Delete from MongoDB
        await File.findByIdAndDelete(req.params.id);

        res.json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ error: "Failed to delete file" });
    }
});

export default router;
