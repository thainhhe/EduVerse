const Category = require("../models/Category");
const Course = require("../models/Course");

// Create a new category
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        // Check if category existed
        const existingCategory = await Category.findOne({ name: name });
        if (existingCategory) {
            return res.status(400).json({ message: "Category name already exists" });
        }

        const newCategory = new Category({ name, description });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
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

        // Check if any course references this category
        const courseUsingCategory = await Course.findOne({ category: categoryId });
        if (courseUsingCategory) {
            return res.status(400).json({ message: "Cannot delete category: have one or more courses are assigned to it" });
        }

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

// Get list courses by category ID
const getCoursesByCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const courses = await Course.find({ category: categoryId });

        const quantityCourse = courses.length;
        if (quantityCourse === 0) {
            return res.status(404).json({ message: "No courses found for this category" });
        }

        res.status(200).json({ quantityCourse, courses });
    } catch (error) {
        res.status(500).json({ message: "Error fetching courses for category", error });
    }
};


module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCoursesByCategory,
};