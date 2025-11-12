const instructorHelper = {
    getDateRange: (filter) => {
        const now = new Date();
        let startDate, endDate;

        switch (filter) {
            case "week": {
                const firstDayOfWeek = new Date(now);
                firstDayOfWeek.setDate(now.getDate() - now.getDay());
                firstDayOfWeek.setHours(0, 0, 0, 0);
                startDate = firstDayOfWeek;
                endDate = new Date(now);
                break;
            }
            case "month": {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            }
            case "year": {
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            }
            default:
                startDate = null;
                endDate = null;
        }

        return { startDate, endDate };
    },
};

module.exports = { instructorHelper };
