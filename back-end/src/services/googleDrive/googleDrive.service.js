// services/googleDrive.service.js
const fs = require('fs');
const drive = require('../../config/googleDrive.config');

const googleDriveService = {
    uploadFile: async (file, folderId) => {
        try {
            const response = await drive.files.create({
                requestBody: {
                    name: `${Date.now()}-${file.originalname}`,
                    parents: [folderId], 
                    mimeType: file.mimetype,
                },
                media: {
                    mimeType: file.mimetype,
                    body: fs.createReadStream(file.path), // Đọc stream từ file tạm
                },
                // YÊU CẦU 'size' - SỬA LỖI fileSize: 0
                fields: "id, name, size, webViewLink, mimeType", 
            });
            console.log('Upload lên Google Drive thành công:', response.data);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi upload lên Google Drive:', error.message);
            throw error;
        } finally {
            // Luôn xóa file tạm
            fs.unlink(file.path, (err) => {
                if (err) console.error("Lỗi xóa file tạm:", file.path, err);
            });
        }
    }
};
module.exports = googleDriveService;