const Category = require('../models/category.model');

class CategoryService {
    // Create a new category
    static async createCategory(data) {
        const { name, description } = data;
        if (!name) {
            throw { status: 400, message: "Category name is required" };
        }

        // Check if category existed
        const existingCategory = await Category.findOne({ name: name });
        if (existingCategory) {
            throw { status: 400, message: "Category name already exists" };
        }

        const newCategory = new Category({ name, description });
        return await newCategory.save();
    }

    // Update a category
    static async updateCategory(categoryId, updateData) {
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, updateData, { new: true });
        if (!updatedCategory) {
            throw { status: 404, message: "Category not found" };
        }
        return updatedCategory;
    }

    // Delete a category
    static async deleteCategory(categoryId) {
        // Check if any course references this category
        const courseUsingCategory = await Course.findOne({ category: categoryId });
        if (courseUsingCategory) {
            throw { status: 400, message: "Cannot delete category: have one or more courses are assigned to it" };
        }
        
        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            throw { status: 404, message: "Category not found" };
        }
        return { message: "Category deleted successfully" };
    }
}

module.exports = CategoryService;