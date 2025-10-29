const materialHelper = {
    formatMaterial: (data) => {
        if (!data) return null;

        return {
            id: data._id?.toString() || data.id,
            title: data.title,
            description: data.description,
            url: data.url,
            type: data.type,
            uploadedBy: data.uploadedBy?._id?.toString() || data.uploadedBy,
            uploaderName: data.uploadedBy?.username || null,
            uploaderEmail: data.uploadedBy?.email || null,
            uploadedAt: data.uploadedAt,
            accessLevel: data.accessLevel,
            downloadCount: data.downloadCount,
            status: data.status,
            // Add file metadata if available
            fileId: data.fileId,
            fileName: data.fileName,
            fileSize: data.fileSize,
            fileSizeFormatted: data.fileSize 
                ? `${(data.fileSize / (1024 * 1024)).toFixed(2)} MB`
                : null,
            mimeType: data.mimeType,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },

    formatMaterials: (materials) => {
        if (!Array.isArray(materials)) return [];
        return materials.map((material) => materialHelper.formatMaterial(material));
    },

    getFileTypeFromMimetype: (mimetype) => {
        if (mimetype.startsWith('video/')) return 'video';
        if (mimetype.startsWith('application/')) return 'document';
        return 'unknown';
    },
};

module.exports = materialHelper;