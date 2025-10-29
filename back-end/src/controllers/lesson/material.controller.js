const materialServices = require('../../services/material/material.services');

const materialController = {
    // Get all materials
    getAllMaterials: async (req, res) => {
        try {
            const filters = {};
            if (req.query.type) filters.type = req.query.type;
            if (req.query.status) filters.status = req.query.status;
            if (req.query.accessLevel) filters.accessLevel = req.query.accessLevel;

            const result = await materialServices.getAllMaterials(filters);
            return res.status(result.status).json({
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            console.error('Controller Error - getAllMaterials:', error);
            return res.status(500).json({
                message: 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && {
                    error: error.message,
                    stack: error.stack,
                }),
            });
        }
    },

    // Get material by ID
    getMaterialById: async (req, res) => {
        try {
            const materialId = req.params.id;
            const result = await materialServices.getMaterialById(materialId);
            return res.status(result.status).json({
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            console.error('Controller Error - getMaterialById:', error);
            return res.status(500).json({
                message: 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && {
                    error: error.message,
                    stack: error.stack,
                }),
            });
        }
    },

    // Get materials by type
    getMaterialsByType: async (req, res) => {
        try {
            const type = req.params.type;
            const result = await materialServices.getMaterialsByType(type);
            return res.status(result.status).json({
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            console.error('Controller Error - getMaterialsByType:', error);
            return res.status(500).json({
                message: 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && {
                    error: error.message,
                    stack: error.stack,
                }),
            });
        }
    },

    // Get materials by user
    getMaterialsByUser: async (req, res) => {
        try {
            const userId = req.params.userId;
            const result = await materialServices.getMaterialsByUser(userId);
            return res.status(result.status).json({
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            console.error('Controller Error - getMaterialsByUser:', error);
            return res.status(500).json({
                message: 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && {
                    error: error.message,
                    stack: error.stack,
                }),
            });
        }
    },

    // Create material with link (no file upload)
    createMaterialWithLink: async (req, res) => {
        try {
            const materialData = req.body;
            const result = await materialServices.createMaterialWithLink(materialData);
            return res.status(result.status).json({
                message: result.message,
                data: result.data,
                ...(result.errors && { errors: result.errors }),
            });
        } catch (error) {
            console.error('Controller Error - createMaterialWithLink:', error);
            return res.status(500).json({
                message: 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && {
                    error: error.message,
                    stack: error.stack,
                }),
            });
        }
    },

    // Upload material (video or document)
    uploadMaterial: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: 'No file uploaded',
                });
            }

            const materialData = {
                title: req.body.title,
                description: req.body.description,
                type: req.body.type,
                uploadedBy: req.body.uploadedBy,
                accessLevel: req.body.accessLevel || 'private',
                status: req.body.status || 'active',
            };

            const result = await materialServices.uploadMaterial(req.file, materialData);
            return res.status(result.status).json({
                message: result.message,
                data: result.data,
                ...(result.errors && { errors: result.errors }),
            });
        } catch (error) {
            console.error('Controller Error - uploadMaterial:', error);
            return res.status(500).json({
                message: 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && {
                    error: error.message,
                    stack: error.stack,
                }),
            });
        }
    },

    // Update material
    updateMaterial: async (req, res) => {
        try {
            const materialId = req.params.id;
            const materialData = req.body;
            const result = await materialServices.updateMaterial(materialId, materialData);
            return res.status(result.status).json({
                message: result.message,
                data: result.data,
                ...(result.errors && { errors: result.errors }),
            });
        } catch (error) {
            console.error('Controller Error - updateMaterial:', error);
            return res.status(500).json({
                message: 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && {
                    error: error.message,
                    stack: error.stack,
                }),
            });
        }
    },

    // Delete material
    deleteMaterial: async (req, res) => {
        try {
            const materialId = req.params.id;
            const result = await materialServices.deleteMaterial(materialId);
            return res.status(result.status).json({
                message: result.message,
            });
        } catch (error) {
            console.error('Controller Error - deleteMaterial:', error);
            return res.status(500).json({
                message: 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && {
                    error: error.message,
                    stack: error.stack,
                }),
            });
        }
    },

    // Track download
    trackDownload: async (req, res) => {
        try {
            const materialId = req.params.id;
            const result = await materialServices.trackDownload(materialId);
            return res.status(result.status).json({
                message: result.message,
            });
        } catch (error) {
            console.error('Controller Error - trackDownload:', error);
            return res.status(500).json({
                message: 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && {
                    error: error.message,
                    stack: error.stack,
                }),
            });
        }
    },
};

module.exports = materialController;