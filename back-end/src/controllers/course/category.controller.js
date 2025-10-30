const categoryService = require('../../services/category/category.services');
const {response, error_response} = require('../../utils/response.util');

const getAllCategories = async (req, res) => {
    try {
        const result = await categoryService.getAllCategories();
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await categoryService.getCategoryById(id);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

const createCategory = async (req, res) => {
    try {
        const categoryData = req.body;
        const result = await categoryService.createCategory(categoryData);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryData = req.body;
        const result = await categoryService.updateCategory(id, categoryData);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await categoryService.deleteCategory(id);
        return response(res, result);
    } catch (error) {
        return error_response(res, error);
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};