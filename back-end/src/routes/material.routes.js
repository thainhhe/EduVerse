// routes/material.route.js
const express = require('express');
const router = express.Router();
const materialController = require('../controllers/lesson/material.controller');
const upload = require('../middlewares/system/materialUpload.middleware');

// POST /api/v1/material
router.post('/', upload.single('file'), materialController.uploadMaterial);

// GET /api/v1/material/:id/view
router.get('/:id/view', materialController.getMaterialView);

module.exports = router;