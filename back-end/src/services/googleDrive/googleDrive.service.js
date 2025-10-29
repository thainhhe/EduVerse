const googleDriveConfig = require('../../config/googleDrive.config');
const fs = require('fs');
const { Readable } = require('stream');

const googleDriveService = {
    /**
     * Upload file to Google Drive
     * @param {Object} file - Multer file object
     * @param {String} type - 'video' or 'document'
     * @returns {Object} { fileId, fileUrl, fileName, fileSize, mimeType }
     */
    uploadFile: async (file, type) => {
        try {
            console.log('📤 Starting upload to Google Drive...');
            console.log('File:', file.originalname);
            console.log('Type:', type);
            console.log('Size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');

            const drive = googleDriveConfig.getDrive();
            
            // Determine folder ID based on type
            const folderId = type === 'video'
                ? process.env.GOOGLE_DRIVE_FOLDER_VIDEO 
                : process.env.GOOGLE_DRIVE_FOLDER_DOCUMENT;

            if (!folderId) {
                throw new Error(`Google Drive folder ID for ${type} not configured`);
            }

            // Create readable stream from buffer
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
            });

            // Set file permissions to 'anyone with link can view'
            await drive.permissions.create({
                fileId: response.data.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            console.log('✅ Upload successful! File ID:', response.data.id);

            return {
                fileId: response.data.id,
                fileUrl: response.data.webViewLink,
                downloadUrl: response.data.webContentLink,
                fileName: response.data.name,
                fileSize: parseInt(response.data.size),
                mimeType: response.data.mimeType,
            };
        } catch (error) {
            console.error('❌ Google Drive upload error:', error);
            throw new Error(`Failed to upload file to Google Drive: ${error.message}`);
        }
    },

    /**
     * Delete file from Google Drive
     * @param {String} fileId - Google Drive file ID
     */
    deleteFile: async (fileId) => {
        try {
            console.log('🗑️ Deleting file from Google Drive:', fileId);
            
            const drive = googleDriveConfig.getDrive();
            
            await drive.files.delete({
                fileId: fileId,
            });

            console.log('✅ File deleted successfully');
            return { success: true, message: 'File deleted from Google Drive' };
        } catch (error) {
            console.error('❌ Google Drive delete error:', error);
            throw new Error(`Failed to delete file from Google Drive: ${error.message}`);
        }
    },

    /**
     * Get file metadata from Google Drive
     * @param {String} fileId - Google Drive file ID
     */
    getFileMetadata: async (fileId) => {
        try {
            const drive = googleDriveConfig.getDrive();
            
            const response = await drive.files.get({
                fileId: fileId,
                fields: 'id, name, mimeType, size, webViewLink, createdTime',
            });

            return response.data;
        } catch (error) {
            console.error('❌ Get file metadata error:', error);
            throw new Error(`Failed to get file metadata: ${error.message}`);
        }
    },

    /**
     * Update file permissions
     * @param {String} fileId - Google Drive file ID
     * @param {String} role - 'reader', 'writer', 'commenter'
     */
    updateFilePermissions: async (fileId, role = 'reader') => {
        try {
            const drive = googleDriveConfig.getDrive();
            
            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: role,
                    type: 'anyone',
                },
            });

            return { success: true, message: 'Permissions updated' };
        } catch (error) {
            console.error('❌ Update permissions error:', error);
            throw new Error(`Failed to update permissions: ${error.message}`);
        }
    },
};

module.exports = googleDriveService;
