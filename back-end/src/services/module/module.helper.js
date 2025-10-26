const moduleHelper = {
    formatModuleData: (module) => {
        if (!module) return null;
        return {
            id: module._id,
            title: module.title,
            description: module.description,
            content: module.content,
            order: module.order,
            status: module.status,
            lessons: module?.lessons || [],
        };
    },
    sortModuleByOrder: (modules = []) => {
        return [...modules].sort((a, b) => (a.order || 0) - (b.order || 0));
    },
    getNextModule: (modules = [], currentOrder) => {
        const sorted = moduleHelper.sortModuleByOrder(modules);
        const index = sorted.findIndex((l) => l.order === currentOrder);
        if (index >= 0 && index < sorted.length - 1) {
            return sorted[index + 1];
        }
        return null;
    },
};

module.exports = { moduleHelper };
