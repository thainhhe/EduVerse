const express = require('express');
const materialRouter = express.Router();
const materialController = require('../controllers/lesson/material.controller');
const { uploadFile } = require('../middlewares/system/materialUpload.middleware');

// get all materials
materialRouter.get('/', materialController.getAllMaterials);
// get material by id
materialRouter.get('/:id', materialController.getMaterialById);
// get materials by type
materialRouter.get('/type/:type', materialController.getMaterialsByType);
// get materials by user
materialRouter.get('/user/:userId', materialController.getMaterialsByUser);
// create material with link
materialRouter.post('/link', materialController.createMaterialWithLink);
// upload material file
materialRouter.post('/upload', uploadFile, materialController.uploadMaterial);
// update material
materialRouter.put('/:id', materialController.updateMaterial);
// delete material
materialRouter.delete('/:id', materialController.deleteMaterial);
// track material download
materialRouter.post('/:id/download', materialController.trackDownload);

module.exports = materialRouter;