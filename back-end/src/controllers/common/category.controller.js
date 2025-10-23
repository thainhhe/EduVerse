const Category = require("../models/Category");
const Course = require("../models/Course");

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
    getAllCategories,
    getCategoryById,
    getCoursesByCategory,
};