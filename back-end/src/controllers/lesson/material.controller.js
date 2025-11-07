// MaterialController.js
const Material = require('../../models/Material');
const driveService = require('../../services/googleDrive/googleDrive.service');

class MaterialController {
    async uploadMaterial(req, res) {
        
        // --- LOGGING BẮT ĐẦU ---
        console.log('============================================');
        console.log('--- BẮT ĐẦU YÊU CẦU UPLOAD MATERIAL ---');
        console.log('Body data (req.body):', req.body);
        console.log('File data from multer (req.file):', req.file);
        console.log('============================================');
        // --- LOGGING KẾT THÚC ---

        try {
            const { uploadedBy, accessLevel, title, description } = req.body;
            const file = req.file;

            if (!file) {
                // Log lỗi thiếu file
                console.log('LỖI: Không tìm thấy req.file. Dừng upload.');
                return res.status(400).json({
                    success: false,
                    message: "Missing file"
                });
            }

            console.log('Đã có file. Bắt đầu gọi driveService.uploadFile...');
            const folderId = process.env.DRIVE_FOLDER_ID;

            // Dịch vụ Drive sẽ tự log (như chúng ta đã sửa ở bước trước)
            const driveFile = await driveService.uploadFile(file, folderId);

            console.log('Đã upload lên Drive xong. Bắt đầu lưu vào DB...');

            // ✅ SỬA ĐỔI TẠI ĐÂY
            // Tạo link "preview" (xem trước) thay vì "view" (xem)
            const embedLink = `https://drive.google.com/file/d/${driveFile.id}/preview`;
            
            const material = await Material.create({
                title: title || file.originalname,
                description,
                url: embedLink, // ✅ SỬA: Dùng link "preview"
                type: file.mimetype.startsWith("video") ? "video" : "document",
                fileId: driveFile.id,
                fileName: driveFile.name,
                fileSize: parseInt(driveFile.size) || 0, 
                mimeType: file.mimetype,
                uploadedBy,
                accessLevel: accessLevel || "private",
                status: "active",
            });

            // Log dữ liệu trả về thành công
            console.log('THÀNH CÔNG: Đã lưu vào DB. Dữ liệu trả về cho client:');
            console.log(material);

            return res.status(201).json({
                success: true,
                message: "Upload material thành công",
                data: material,
            });

        } catch (error) {
            // Log nếu có lỗi ở bất kỳ đâu
            console.log('LỖI NGHIÊM TRỌNG: Rơi vào CATCH block.');
            console.error(error); 
            
            return res.status(500).json({
                success: false,
                message: "Lỗi upload material",
                error: error.message,
            });
        }
    }
}

module.exports = new MaterialController();