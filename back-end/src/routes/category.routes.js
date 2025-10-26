const express = require('express');
const categoryController = require("../controllers/course/category.controller.js");
const { verifyToken } = require('../middlewares/auth/authMiddleware.js');
const categoryRouter = express.Router();

categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.get('/:id', categoryController.getCategoryById);
categoryRouter.post('/', verifyToken, categoryController.createCategory);
categoryRouter.put('/:id', verifyToken, categoryController.updateCategory);
categoryRouter.delete('/:id', verifyToken, categoryController.deleteCategory);

module.exports = categoryRouter;

