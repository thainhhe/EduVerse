// middlewares/system/materialUpload.middleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Chỉ định thư mục tạm
// Chúng ta dùng path.join(__dirname, '..', '..', 'uploads_temp') 
// để đi lùi 2 cấp (từ /middlewares/system -> thư mục gốc) rồi vào 'uploads_temp'
const tempUploadDir = path.join(__dirname, '..', '..', 'uploads_temp');

// 2. Tự động tạo thư mục tạm nếu nó chưa tồn tại
if (!fs.existsSync(tempUploadDir)) {
    fs.mkdirSync(tempUploadDir, { recursive: true });
    console.log('Đã tạo thư mục tạm tại:', tempUploadDir);
}

// 3. Cấu hình DiskStorage (Lưu vào thư mục tạm)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempUploadDir); // Lưu file vào thư mục tạm
    },
    filename: (req, file, cb) => {
        // Đặt tên file tạm (độc nhất)
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// 4. Lọc loại file (Cho phép video VÀ tài liệu)
const fileFilter = (req, file, cb) => {
    const videoTypes = /mp4|avi|mov|wmv|flv|mkv|webm/;
    const docTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt/;

    // Lấy phần mở rộng (đuôi file)
    const extname = path.extname(file.originalname).toLowerCase().substring(1);
    
    // Lấy kiểu file
    const mimetype = file.mimetype;

    const isAllowed = videoTypes.test(extname) || docTypes.test(extname) || 
                      mimetype.startsWith('video/') || 
                      mimetype.startsWith('application/pdf') ||
                      mimetype.includes('msword') || // .doc
                      mimetype.includes('officedocument'); // .docx, .pptx, .xlsx

    if (isAllowed) {
        cb(null, true);
    } else {
        cb(new Error('Loại file không được hỗ trợ'), false);
    }
};

// 5. Khởi tạo Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        // Giới hạn 2GB (như đã bàn)
        fileSize: 1024 * 1024 * 1024 * 2 
    },
});

module.exports = upload;