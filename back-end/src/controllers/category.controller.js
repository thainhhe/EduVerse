const Category = require("../models/Category");

// Create a new category
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCategory = new Category({ name, description });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory, message="Category created successfully");
    } catch (error) {
        res.status(500).json({ message: "Error creating category", error });
    }
};

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error });
    }
};

// Get category by ID
const getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: "Error fetching category", error });
    }
};

// Update a category
const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const updateData = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, updateData, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(updatedCategory);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating category", error });
    }
};

// Delete a category
const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting category", error });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};