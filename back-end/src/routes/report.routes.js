const express = require('express');
const router = express.Router();
const reportController = require('../controllers/users/report.controller');
const { validateCreateReport, validateUpdateStatus } = require('../validator/report.validator');

// === Student Routes ===
router.post(
    '/',
    validateCreateReport,
    reportController.createReport
);

router.get(
    '/my-reports/:userId',
    reportController.getMyReports
);

// === Instructor Routes ===
router.get(
    '/assigned/:instructorId', 
    reportController.getAssignedReports
);

router.put(
    '/:id/status',
    validateUpdateStatus,
    reportController.updateReportStatus
);

// === Admin Routes ===
router.get(
    '/all',
    reportController.getAllReports
);

router.put(
    '/:id/admin-update',
    validateUpdateStatus,
    reportController.adminUpdateReport
);

router.delete(
    '/:id/admin',
    reportController.adminDeleteReport
);

module.exports = router;