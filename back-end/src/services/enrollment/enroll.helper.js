const enrollHelper = {
    formatEnrollment: (data) => {
        if (!data) return null;
        
        return {
            id: data._id?.toString() || data.id,
            userId: data.userId?._id?.toString() || data.userId,
            userName: data.userId?.name || data.userId?.username || null,
            courseId: data.courseId?._id?.toString() || data.courseId,
            courseTitle: data.courseId?.title || null,
            enrollmentDate: data.enrollmentDate,
            endDate: data.endDate,
            progress: data.progress || 0,
            status: data.status || 'enrolled',
            lastAccessed: data.lastAccessed,
            grade: data.grade,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },

    formatEnrollments: (enrollments) => {
        if (!Array.isArray(enrollments)) return [];
        return enrollments.map(enrollment => enrollHelper.formatEnrollment(enrollment));
    }
};

module.exports = enrollHelper;