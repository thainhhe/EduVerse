const googleDriveConfig = require('../../config/googleDrive.config');
const { Readable } = require('stream');

const googleDriveService = {
    uploadFile: async (file, type) => {
        try {
            console.log('📤 Starting upload to Google Drive...');
            console.log('File:', file.originalname);
            console.log('Type:', type);
            console.log('Size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');
            console.log('Buffer size:', file.buffer ? file.buffer.length : 'NO BUFFER');

            const drive = googleDriveConfig.getDrive();
            
            const folderId = type === 'video' 
                ? process.env.GOOGLE_DRIVE_FOLDER_VIDEO 
                : process.env.GOOGLE_DRIVE_FOLDER_DOCUMENT;

            if (!folderId) {
                throw new Error(`Google Drive folder ID for ${type} not configured`);
            }

            // ✅ CHECK buffer tồn tại
            if (!file.buffer) {
                throw new Error('File buffer is empty!');
            }

            // ✅ Tạo stream từ buffer
            const bufferStream = Readable.from(file.buffer);

            const fileMetadata = {
                name: `${Date.now()}-${file.originalname}`,
                parents: [folderId],
            };

            const media = {
                mimeType: file.mimetype,
                body: bufferStream,
            };

            console.log('⏳ Uploading to folder:', folderId);

            const response = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id, name, mimeType, size, webViewLink, webContentLink',
                supportsAllDrives: true,
            });

            console.log('✅ Upload response:', {
                id: response.data.id,
                size: response.data.size,
                name: response.data.name
            });

            // ✅ KIỂM TRA file size
            const uploadedSize = parseInt(response.data.size || '0');
            console.log('📦 Uploaded file size:', uploadedSize, 'bytes');

            if (uploadedSize === 0) {
                throw new Error('Upload failed: File size is 0 bytes on Google Drive');
            }

            // Set permissions
            await drive.permissions.create({
                fileId: response.data.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
                supportsAllDrives: true,
            });

            console.log('✅ Upload successful! File ID:', response.data.id);

            // Tạo preview URLs
            const fileId = response.data.id;
            const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
            const embedUrl = `https://drive.google.com/file/d/${fileId}/preview?embedded=true`;

            return {
                fileId: fileId,
                fileUrl: previewUrl,
                embedUrl: embedUrl,
                downloadUrl: response.data.webContentLink,
                viewUrl: response.data.webViewLink,
                fileName: response.data.name,
                fileSize: uploadedSize,
                mimeType: response.data.mimeType,
            };
        } catch (error) {
            console.error('❌ Google Drive upload error:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                status: error.status
            });
            throw new Error(`Failed to upload file to Google Drive: ${error.message}`);
        }
    },

    deleteFile: async (fileId) => {
        try {
            console.log('🗑️ Deleting file from Google Drive:', fileId);
            
            const drive = googleDriveConfig.getDrive();
            
            await drive.files.delete({
                fileId: fileId,
                supportsAllDrives: true,
            });

            console.log('✅ File deleted successfully');
            return { success: true, message: 'File deleted from Google Drive' };
        } catch (error) {
            console.error('❌ Google Drive delete error:', error);
            throw new Error(`Failed to delete file from Google Drive: ${error.message}`);
        }
    },
};

module.exports = googleDriveService;