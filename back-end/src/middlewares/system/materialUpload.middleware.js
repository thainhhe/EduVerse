// materialUpload.middleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // <-- Thêm fs

// Tạo thư mục tạm (ví dụ: 'uploads_temp' ngang hàng với 'controllers')
const tempUploadDir = path.join(__dirname, '../uploads_temp');
if (!fs.existsSync(tempUploadDir)) {
    fs.mkdirSync(tempUploadDir, { recursive: true });
}

// ✅ SỬA: Dùng diskStorage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempUploadDir); // Lưu file vào thư mục tạm
    },
    filename: (req, file, cb) => {
        // Đặt tên file tạm (không quá quan trọng vì sẽ đổi tên trên Drive)
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    // ... (Phần này giữ nguyên, đã đúng)
    const videoTypes = /mp4|avi|mov|wmv|flv|mkv|webm/;
    const docTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt/;

    const extname = path.extname(file.originalname).toLowerCase();
    const isAllowed = videoTypes.test(extname) || docTypes.test(extname);
    if (isAllowed) cb(null, true);
    else cb(new Error('Unsupported file'), false);
};

const upload = multer({
    storage: storage, // ✅ SỬA: Dùng diskStorage đã config
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 1024 * 2 }, // 1GB
});

module.exports = upload;