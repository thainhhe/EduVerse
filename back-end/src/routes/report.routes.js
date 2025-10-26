const express = require("express");
const reportController = require("../controllers/users/report.controller");
const { verifyToken } = require("../middlewares/auth/authMiddleware");

const reportRouter = express.Router();

// Get all reports
reportRouter.get('/', reportController.getAllReports);
// Get report by ID
reportRouter.get('/:id', reportController.getReportById);
// Create new report
reportRouter.post('/', reportController.createReport);
// Update report by ID
reportRouter.put('/:id', reportController.updateReport);
// Delete report by ID
reportRouter.delete('/:id', reportController.deleteReport);

module.exports = reportRouter;
