const { system_enum } = require("../../config/enum/system.constant");
const { category_enum } = require("../../config/enum/category.constant");
const categoryRepository = require("../../repositories/category.repository");
const { categoryValidator } = require("../../validator/category.validator");
const categoryHelper = require("./category.helper");

const categoryServices = {
    getAllCategories: async () => {
        try {
            const categories = await categoryRepository.getAll();
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: categoryHelper.formatCategories(categories),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    getCategoryById: async (id) => {
        try {
            const category = await categoryRepository.getById(id);

            if (!category) {
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: category_enum.CATEGORY_MESSAGE.CATEGORY_NOT_FOUND || "Category not found",
                };
            }

            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: categoryHelper.formatCategory(category),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    createCategory: async (categoryData) => {
        try {
            const validationResult = categoryValidator.validateCategoryData(categoryData, false);
            if (!validationResult.valid) {
                return {
                    status: system_enum.STATUS_CODE.BAD_REQUEST,
                    message: validationResult.errors,
                };
            }

            const validatedData = validationResult.data;

            const existingCategory = await categoryRepository.getByName(validatedData.name);
            if (existingCategory) {
                return {
                    status: system_enum.STATUS_CODE.BAD_REQUEST,
                    message: category_enum.CATEGORY_MESSAGE.DUPLICATE_CATEGORY || "A category with this name already exists",
                };
            }

            const newCategory = await categoryRepository.create(validatedData);

            return {
                status: system_enum.STATUS_CODE.CREATED,
                message: category_enum.CATEGORY_MESSAGE.CREATE_SUCCESS || "Category created successfully",
                data: categoryHelper.formatCategory(newCategory),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    updateCategory: async (id, categoryData) => {
        try {
            const validationResult = categoryValidator.validateCategoryData(categoryData, true);
            if (!validationResult.valid) {
                return {
                    status: system_enum.STATUS_CODE.BAD_REQUEST,
                    message: validationResult.errors,
                };
            }

            const validatedData = validationResult.data;

            const existingCategory = await categoryRepository.getByName(validatedData.name);
            if (existingCategory && existingCategory.id !== id) {
                return {
                    status: system_enum.STATUS_CODE.BAD_REQUEST,
                    message: category_enum.CATEGORY_MESSAGE.DUPLICATE_CATEGORY || "A category with this name already exists",
                };
            }

            const updatedCategory = await categoryRepository.update(id, validatedData);

            if (!updatedCategory) {
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: category_enum.CATEGORY_MESSAGE.CATEGORY_NOT_FOUND || "Category not found",
                };
            }

            return {
                status: system_enum.STATUS_CODE.OK,
                message: category_enum.CATEGORY_MESSAGE.UPDATE_SUCCESS || "Category updated successfully",
                data: categoryHelper.formatCategory(updatedCategory),
            };
        } catch (error) {
            throw new Error(error);
        }
    },

    deleteCategory: async (id) => {
        try {
            const deleted = await categoryRepository.delete(id);

            if (!deleted) {
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: category_enum.CATEGORY_MESSAGE.CATEGORY_NOT_FOUND || "Category not found",
                };
            }

            return {
                status: system_enum.STATUS_CODE.OK,
                message: category_enum.CATEGORY_MESSAGE.DELETE_SUCCESS || "Category deleted successfully",
                data: categoryHelper.formatCategory(deleted),
            };
        } catch (error) {
            throw new Error(error);
        }
    },
};

module.exports = categoryServices;