const express = require('express');
const { getAllCategories, getCategoryById,  getCoursesByCategory } = require('../controllers/common/category.controller.js');
const { createCategory, updateCategory, deleteCategory } = require('../controllers/admin/manage-category.controller.js');
const { verifyToken } = require('../middlewares/authMiddleware.js');
const { checkPermission } = require('../middlewares/permissionMiddleware.js');

const categoryRouter = express.Router();

//Admin routes
// Create a new category
categoryRouter.post('/create', verifyToken, checkPermission(['admin'], ['manage_categories']), createCategory);

// Update a category by ID
categoryRouter.put('/update/:id', verifyToken, checkPermission(['admin'], ['manage_categories']), updateCategory);

// Delete a category by ID
categoryRouter.delete('/delete/:id', verifyToken, checkPermission(['admin'], ['manage_categories']), deleteCategory);

// Public routes
// Get all categories
categoryRouter.get('/', getAllCategories);

// Get a category by ID
categoryRouter.get('/:id', getCategoryById);

// Get courses by category ID
categoryRouter.get('/:id/courses', getCoursesByCategory);

// Export the categoryRouter
module.exports = categoryRouter;