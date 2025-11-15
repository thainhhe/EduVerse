// controllers/lesson/material.controller.js
const Lesson = require("../../models/Lesson");
const Material = require("../../models/Material");
const googleDriveService = require("../../services/googleDrive/googleDrive.service");

class MaterialController {
    // HÀM UPLOAD
    async uploadMaterial(req, res) {
        try {
            const { ...bodyData } = req.body;
            console.log("bodyData", bodyData);
            const file = req.file;
            if (!file) return res.status(400).json({ success: false, message: "Missing file" });

            // 2️⃣ Kiểm tra lessonId
            if (!bodyData.lessonId) {
                return res.status(400).json({ success: false, message: "Missing lessonId" });
            }

            const lesson = await Lesson.findById(bodyData.lessonId);
            console.log("lesson", lesson);
            if (!lesson) {
                return res.status(404).json({ success: false, message: "Lesson not found" });
            }

            const folderId = process.env.DRIVE_FOLDER_ID;
            const driveFile = await googleDriveService.uploadFile(file, folderId);

            //   TẠO LINK XEM (luôn dùng /preview)
            let viewUrl = driveFile.webViewLink;
            if (viewUrl) {
                viewUrl = viewUrl.replace("/view", "/preview");
            }

            const material = await Material.create({
                title: bodyData.title || driveFile.name,
                description: bodyData.description,
                url: viewUrl,
                type: file.mimetype.startsWith("video/") ? "video" : "document",
                fileId: driveFile.id,
                fileName: driveFile.name,
                fileSize: parseInt(driveFile.size, 10) || 0, // SỬA LỖI
                mimeType: driveFile.mimeType,
                status: "active",
                uploadedBy: bodyData.uploadedBy,
                accessLevel: bodyData.accessLevel || "private",
                lessonId: bodyData.lessonId,
            });

            console.log("material", material);
            return res.status(201).json({
                success: true,
                message: "Upload lên Google Drive thành công.",
                data: material,
            });
        } catch (error) {
            console.error("LỖI (Controller GDrive):", error.message);
            return res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
        }
    }

    // HÀM LẤY LINK XEM
    async getMaterialView(req, res) {
        try {
            // (Bạn nên kiểm tra quyền Auth ở đây)
            const material = await Material.findById(req.params.id);
            if (!material) return res.status(404).json({ message: "Không tìm thấy" });

            res.json({
                success: true,
                url: material.url,
                type: material.type,
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async getMaterialsByLessonId(req, res) {
        try {
            const { lessonId } = req.params;

            if (!lessonId) return res.status(400).json({ success: false, message: "Missing lessonId" });

            const materials = await Material.find({ lessonId }).sort({ createdAt: -1 }).lean();

            if (!materials.length) return res.status(404).json({ success: false, message: "No materials found" });

            res.json({
                success: true,
                count: materials.length,
                data: materials,
            });
        } catch (error) {
            console.error("Lỗi khi lấy material:", error);
            res.status(500).json({
                success: false,
                message: "Server error",
                error: error.message,
            });
        }
    }
}
module.exports = new MaterialController();
