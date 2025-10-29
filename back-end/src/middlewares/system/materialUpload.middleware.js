// const multer = require('multer');

// // File size limits
// const MAX_VIDEO_SIZE = parseInt(process.env.MAX_VIDEO_SIZE) || 1073741824; // 1GB
// const MAX_DOCUMENT_SIZE = parseInt(process.env.MAX_DOCUMENT_SIZE) || 104857600; // 100MB

// // Allowed file types
// const VIDEO_MIMETYPES = ['video/mp4', 'video/quicktime']; // mp4, mov
// const DOCUMENT_MIMETYPES = [
//     'application/pdf',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
//     'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
// ];

// // Use memory storage (store in buffer)
// const storage = multer.memoryStorage();

// // File filter function
// const fileFilter = (req, file, cb) => {
//     const uploadType = req.body.type || req.query.type;

//     if (uploadType === 'video') {
//         if (VIDEO_MIMETYPES.includes(file.mimetype)) {
//             cb(null, true);
//         } else {
//             cb(new Error('Invalid video format. Only MP4 and MOV are allowed.'), false);
//         }
//     } else if (uploadType === 'document') {
//         if (DOCUMENT_MIMETYPES.includes(file.mimetype)) {
//             cb(null, true);
//         } else {
//             cb(new Error('Invalid document format. Only PDF, DOCX, and PPTX are allowed.'), false);
//         }
//     } else {
//         cb(new Error('Upload type must be either "video" or "document".'), false);
//     }
// };

// // Upload configurations
// const uploadVideo = multer({
//     storage: storage,
//     limits: { fileSize: MAX_VIDEO_SIZE },
//     fileFilter: fileFilter,
// }).single('file');

// const uploadDocument = multer({
//     storage: storage,
//     limits: { fileSize: MAX_DOCUMENT_SIZE },
//     fileFilter: fileFilter,
// }).single('file');

// // Unified upload middleware
// const uploadFile = (req, res, next) => {
//     const uploadType = req.body.type;

//     const upload = uploadType === 'video' ? uploadVideo : uploadDocument;

//     upload(req, res, (err) => {
//         if (err instanceof multer.MulterError) {
//             if (err.code === 'LIMIT_FILE_SIZE') {
//                 const maxSize = uploadType === 'video' ? '1GB' : '100MB';
//                 return res.status(400).json({
//                     message: `File too large. Maximum size for ${uploadType} is ${maxSize}`,
//                 });
//             }
//             return res.status(400).json({ message: err.message });
//         } else if (err) {
//             return res.status(400).json({ message: err.message });
//         }
//         next();
//     });
// };

// // const uploadFile = (req, res, next) => {
// //     const uploadType = req.query.type; // ✅ Chỉ đọc từ query

// //     if (!uploadType) {
// //         return res.status(400).json({ message: 'type is required in query param (video/document)' });
// //     }

// //     const upload = uploadType === 'video' ? uploadVideo : uploadDocument;

// //     upload(req, res, (err) => {
// //         if (err instanceof multer.MulterError) {
// //             if (err.code === 'LIMIT_FILE_SIZE') {
// //                 const maxSize = uploadType === 'video' ? '1GB' : '100MB';
// //                 return res.status(400).json({
// //                     message: `File too large. Maximum size for ${uploadType} is ${maxSize}`,
// //                 });
// //             }
// //             return res.status(400).json({ message: err.message });
// //         } else if (err) {
// //             return res.status(400).json({ message: err.message });
// //         }
// //         next();
// //     });
// // };

// module.exports = { uploadFile, uploadVideo, uploadDocument };


const multer = require('multer');

// File size limits
const MAX_VIDEO_SIZE = parseInt(process.env.MAX_VIDEO_SIZE) || 1073741824; // 1GB
const MAX_DOCUMENT_SIZE = parseInt(process.env.MAX_DOCUMENT_SIZE) || 104857600; // 100MB

// Allowed file types
const VIDEO_MIMETYPES = ['video/mp4', 'video/quicktime']; // mp4, mov
const DOCUMENT_MIMETYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
];

const storage = multer.memoryStorage();

// Only kiểm tra mimetype cơ bản
const fileFilter = (req, file, cb) => {
    if (
        VIDEO_MIMETYPES.includes(file.mimetype) ||
        DOCUMENT_MIMETYPES.includes(file.mimetype)
    ) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format!'), false);
    }
};

// Dùng một config upload duy nhất
const uploadAny = multer({
    storage,
    limits: { fileSize: MAX_VIDEO_SIZE },
    fileFilter,
}).single('file');

// Check đúng type sau khi Multer đã parse req.body
const uploadFile = (req, res, next) => {
    uploadAny(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: 'File is too large! Max: 1GB for video, 100MB for documents.',
                });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        const uploadType = req.body?.type;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded!' });
        }

        if (!uploadType) {
            return res.status(400).json({ message: 'Missing "type" field in form-data!' });
        }

        // ✅ Validate lại type đúng mục đích
        if (uploadType === 'video') {
            if (!VIDEO_MIMETYPES.includes(req.file.mimetype)) {
                return res.status(400).json({
                    message: 'Invalid video format! Only MP4/MOV allowed.',
                });
            }

            // Validate size video
            if (req.file.size > MAX_VIDEO_SIZE) {
                return res.status(400).json({
                    message: 'Video file too large! Max 1GB',
                });
            }
        } else if (uploadType === 'document') {
            if (!DOCUMENT_MIMETYPES.includes(req.file.mimetype)) {
                return res.status(400).json({
                    message: 'Invalid document format! Only PDF, DOCX, PPTX allowed.',
                });
            }

            // Validate size document
            if (req.file.size > MAX_DOCUMENT_SIZE) {
                return res.status(400).json({
                    message: 'Document file too large! Max 100MB',
                });
            }
        } else {
            return res.status(400).json({
                message: 'Upload type must be "video" or "document"',
            });
        }

        next();
    });
};

module.exports = { uploadFile };
