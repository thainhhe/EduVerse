const express = require('express');
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory, getCoursesByCategory } = require('../controllers/category.controller.js');

const categoryRouter = express.Router();

// Create a new category
categoryRouter.post('/create', createCategory);

// Get all categories
categoryRouter.get('/', getAllCategories);

// Get a category by ID
categoryRouter.get('/:id', getCategoryById);

// Update a category by ID
categoryRouter.put('/update/:id', updateCategory);

// Delete a category by ID
categoryRouter.delete('/delete/:id', deleteCategory);

// Get courses by category ID
categoryRouter.get('/:id/courses', getCoursesByCategory);

// Export the categoryRouter
module.exports = categoryRouter;