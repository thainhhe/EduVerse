const categoryHelper = {
    cleanedCategoryData: (data) => {
        if (!data) return data;
        return {
            ...data,
            name: data.name?.trim(),
            description: data.description?.trim(),
        };
    },

    formatCategory: (category) => ({
        id: category._id || category.id, // hỗ trợ cả Mongoose và plain object
        name: category.name,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
    }),

    formatCategories: (categories) => {
        return categories.map((category) => ({
            id: category._id || category.id,
            name: category.name,
            description: category.description,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        }));
    }
};

module.exports = categoryHelper;
