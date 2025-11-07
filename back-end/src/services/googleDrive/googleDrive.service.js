// googleDrive.service.js
const { Readable } = require('stream');
const fs = require('fs');
const googleDriveConfig = require('../../config/googleDrive.config');

const googleDriveService = {
    uploadFile: async (file, folderId) => {
        const drive = googleDriveConfig.getDrive();

        if (!file || !file.path) {
            throw new Error("Invalid file path from multer");
        }

        // LOG 1: Kiểm tra xem file tạm có tồn tại không
        console.log('Attempting to upload file from path:', file.path);

        try {
            const response = await drive.files.create({
                requestBody: {
                    name: `${Date.now()}-${file.originalname}`,
                    parents: [folderId],
                },
                media: {
                    mimeType: file.mimetype,
                    body: fs.createReadStream(file.path)
                },
                fields: "id, name, size, mimeType, webViewLink, webContentLink",
            });

            // LOG 2: Đây là log quan trọng nhất!
            console.log('GOOGLE DRIVE RESPONSE:', response.data);

            return response.data;

        } catch (error) {
            // LOG 3: Bắt lỗi nếu API call thất bại
            console.error('Lỗi từ Google Drive API:', error.message);
            throw error; // Ném lỗi ra để controller bắt

        } finally {
            // ✅ Bỏ comment dòng này để xóa file tạm
            fs.unlink(file.path, (err) => {
                if (err) console.error("Error deleting temp file:", file.path, err);
                else console.log('Temp file deleted successfully:', file.path);
            });
        }
    }
};

module.exports = googleDriveService;