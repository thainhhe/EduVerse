const express = require('express');
const router = express.Router();
const materialController = require('../controllers/lesson/material.controller');
const upload = require('../middlewares/system/materialUpload.middleware');

// Upload material
router.post('/', upload.single('file'), materialController.uploadMaterial);

// // Get all materials
// router.get('/', materialController.getMaterials);

// // Get material by ID
// router.get('/:id', materialController.getMaterialById);

// // Update material
// router.put('/:id', materialController.updateMaterial);

// // Delete material
// router.delete('/:id', materialController.deleteMaterial);

// // Download material
// router.get('/:id/download', materialController.downloadMaterial);

module.exports = router;