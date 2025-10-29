const courseHelper = {
    cleanCourseData: (data) => {
        if (!data) return data;
        const cleaned = {
            ...data,
            title: data.title?.trim(),
            description: data.description?.trim(),
            price: Number(data.price) || 0,
        };
        return cleaned;
    },

    calculateAverageRating: (ratings = []) => {
        if (!Array.isArray(ratings) || ratings.length === 0) return 0;
        const total = ratings.reduce((sum, r) => sum + r, 0);
        return parseFloat((total / ratings.length).toFixed(1));
    },

    toResponseFormat: (course) => {
        if (!course) return null;
        const obj = course.toObject ? course.toObject() : course;
        delete obj.__v;
        delete obj.deleted;
        return obj;
    },
};

module.exports = { courseHelper };
