const materialRepository = require('../../repositories/material.repository');
const materialValidator = require('../../validator/material.validator');
const materialHelper = require('./material.helper');
const googleDriveService = require('../googleDrive/googleDrive.service');

const materialServices = {
    getAllMaterials: async (filters = {}) => {
        try {
            const materials = await materialRepository.getAllMaterials(filters);
            return {
                status: 200,
                message: 'Success',
                data: materialHelper.formatMaterials(materials),
            };
        } catch (error) {
            console.error('Service Error - getAllMaterials:', error);
            throw error;
        }
    },

    getMaterialById: async (id) => {
        try {
            const material = await materialRepository.getMaterialById(id);

            if (!material) {
                return {
                    status: 404,
                    message: 'Material not found',
                };
            }

            return {
                status: 200,
                message: 'Success',
                data: materialHelper.formatMaterial(material),
            };
        } catch (error) {
            console.error('Service Error - getMaterialById:', error);
            throw error;
        }
    },

    getMaterialsByType: async (type) => {
        try {
            const materials = await materialRepository.getMaterialsByType(type);
            return {
                status: 200,
                message: 'Success',
                data: materialHelper.formatMaterials(materials),
            };
        } catch (error) {
            console.error('Service Error - getMaterialsByType:', error);
            throw error;
        }
    },

    getMaterialsByUser: async (userId) => {
        try {
            const materials = await materialRepository.getMaterialsByUser(userId);
            return {
                status: 200,
                message: 'Success',
                data: materialHelper.formatMaterials(materials),
            };
        } catch (error) {
            console.error('Service Error - getMaterialsByUser:', error);
            throw error;
        }
    },

    createMaterialWithLink: async (materialData) => {
        try {
            const validatedData = materialValidator.validateMaterialData(materialData, false);

            const newMaterial = await materialRepository.createMaterial(validatedData);

            return {
                status: 201,
                message: 'Material created successfully',
                data: materialHelper.formatMaterial(newMaterial),
            };
        } catch (error) {
            console.error('Service Error - createMaterialWithLink:', error);

            if (error.isValidation) {
                return {
                    status: 400,
                    message: 'Validation failed',
                    errors: error.validationErrors,
                };
            }

            throw error;
        }
    },

    uploadMaterial: async (file, materialData) => {
        try {
            const validatedData = materialValidator.validateMaterialData(materialData, false);

            const driveFile = await googleDriveService.uploadFile(file, validatedData.type);

            const materialToCreate = {
                ...validatedData,
                url: driveFile.fileUrl,
                fileId: driveFile.fileId,
                fileName: driveFile.fileName,
                fileSize: driveFile.fileSize,
                mimeType: driveFile.mimeType,
            };

            const newMaterial = await materialRepository.createMaterial(materialToCreate);

            return {
                status: 201,
                message: 'Material uploaded successfully',
                data: materialHelper.formatMaterial(newMaterial),
            };
        } catch (error) {
            console.error('Service Error - uploadMaterial:', error);

            if (error.isValidation) {
                return {
                    status: 400,
                    message: 'Validation failed',
                    errors: error.validationErrors,
                };
            }

            throw error;
        }
    },

    updateMaterial: async (id, materialData) => {
        try {
            const validatedData = materialValidator.validateMaterialData(materialData, true);

            const existingMaterial = await materialRepository.getMaterialById(id);
            if (!existingMaterial) {
                return {
                    status: 404,
                    message: 'Material not found',
                };
            }

            const updatedMaterial = await materialRepository.updateMaterial(id, validatedData);

            return {
                status: 200,
                message: 'Material updated successfully',
                data: materialHelper.formatMaterial(updatedMaterial),
            };
        } catch (error) {
            console.error('Service Error - updateMaterial:', error);

            if (error.isValidation) {
                return {
                    status: 400,
                    message: 'Validation failed',
                    errors: error.validationErrors,
                };
            }

            throw error;
        }
    },

    deleteMaterial: async (id) => {
        try {
            const existingMaterial = await materialRepository.getMaterialById(id);
            if (!existingMaterial) {
                return {
                    status: 404,
                    message: 'Material not found',
                };
            }

            // Delete from Google Drive if it has fileId
            if (existingMaterial.fileId) {
                await googleDriveService.deleteFile(existingMaterial.fileId);
            }

            // Delete from database
            await materialRepository.deleteMaterial(id);

            return {
                status: 200,
                message: 'Material deleted successfully',
            };
        } catch (error) {
            console.error('Service Error - deleteMaterial:', error);
            throw error;
        }
    },

    trackDownload: async (id) => {
        try {
            await materialRepository.incrementDownloadCount(id);
            return {
                status: 200,
                message: 'Download tracked',
            };
        } catch (error) {
            console.error('Service Error - trackDownload:', error);
            throw error;
        }
    },
};

module.exports = materialServices;