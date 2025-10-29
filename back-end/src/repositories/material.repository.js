const Material = require('../models/Material');
const User = require('../models/User');

const materialRepository = {
    getAllMaterials: async (filters = {}) => {
        try {
            return await Material.find(filters)
                .populate('uploadedBy', 'username email avatar')
                .sort({ uploadedAt: -1 })
                .exec();
        } catch (error) {
            console.error('Repository Error - getAllMaterials:', error);
            throw error;
        }
    },

    getMaterialById: async (id) => {
        try {
            return await Material.findById(id)
                .populate('uploadedBy', 'username email avatar')
                .exec();
        } catch (error) {
            console.error('Repository Error - getMaterialById:', error);
            throw error;
        }
    },

    getMaterialsByType: async (type) => {
        try {
            return await Material.find({ type, status: 'active' })
                .populate('uploadedBy', 'username email avatar')
                .sort({ uploadedAt: -1 })
                .exec();
        } catch (error) {
            console.error('Repository Error - getMaterialsByType:', error);
            throw error;
        }
    },

    getMaterialsByUser: async (userId) => {
        try {
            return await Material.find({ uploadedBy: userId })
                .sort({ uploadedAt: -1 })
                .exec();
        } catch (error) {
            console.error('Repository Error - getMaterialsByUser:', error);
            throw error;
        }
    },

    createMaterial: async (data) => {
        try {
            const material = await Material.create(data);
            return await Material.findById(material._id)
                .populate('uploadedBy', 'username email avatar')
                .exec();
        } catch (error) {
            console.error('Repository Error - createMaterial:', error);
            throw error;
        }
    },

    updateMaterial: async (id, data) => {
        try {
            return await Material.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            })
                .populate('uploadedBy', 'username email avatar')
                .exec();
        } catch (error) {
            console.error('Repository Error - updateMaterial:', error);
            throw error;
        }
    },

    incrementDownloadCount: async (id) => {
        try {
            return await Material.findByIdAndUpdate(
                id,
                { $inc: { downloadCount: 1 } },
                { new: true }
            ).exec();
        } catch (error) {
            console.error('Repository Error - incrementDownloadCount:', error);
            throw error;
        }
    },

    deleteMaterial: async (id) => {
        try {
            return await Material.findByIdAndDelete(id).exec();
        } catch (error) {
            console.error('Repository Error - deleteMaterial:', error);
            throw error;
        }
    },
};

module.exports = materialRepository;