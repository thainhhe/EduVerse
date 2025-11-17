// File: services/enroll/enroll.helper.js

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
            status: data.status || "enrolled",
            lastAccessed: data.lastAccessed,
            grade: data.grade,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },

    formatEnrollments: (enrollments) => {
        if (!Array.isArray(enrollments)) return [];
        return enrollments.map((enrollment) => enrollHelper.formatEnrollment(enrollment));
    },

    /**
     * ✨ HÀM ĐÃ ĐƯỢC SỬA LẠI HOÀN CHỈNH ✨
     */
    formatDetailedEnrollment: (enrollment) => {
        const course = enrollment.courseId || {};
        const userId = enrollment.userId?._id?.toString();

        // ✨ --- ĐÃ XÓA LOGIC TÍNH TOÁN SAI --- ✨
        // const totalLessons = ... (ĐÃ XÓA)
        // const completedLessons = ... (ĐÃ XÓA)
        // const calculatedProgress = ... (ĐÃ XÓA)

        return {
            _id: enrollment._id?.toString(),
            userId: enrollment.userId, // Giữ object user đầy đủ
            enrollmentDate: enrollment.enrollmentDate,

            // Đây là progress ĐÚNG (75%) từ DB
            progress: enrollment.progress || 0,
            status: enrollment.status || "enrolled",

            // ✨ THÊM TRƯỜNG 'GRADE' VÀO ✨
            grade: enrollment.grade || "Incomplete",

            // calculatedProgress, // <-- ĐÃ XÓA BỎ TRƯỜNG NÀY

            // Các thống kê này vẫn hữu ích
            totalQuizzes: enrollment.totalQuizzes || 0,
            completedQuizzes: enrollment.completedQuizzes || 0,
            averageScore: enrollment.averageScore || 0,

            courseId: {
                ...course,
                // Format lại sub-documents (nếu cần)
                modules: course.modules?.map((module) => ({
                    ...module,
                    lessons: module.lessons?.map((lesson) => ({
                        ...lesson,
                        // Cập nhật lại logic check user_completed
                        isCompleted: lesson.user_completed?.some(id => id.toString() === userId),
                        quiz: lesson.quiz || null,
                        quizScores: lesson.quizScores || [],
                    })) || [],
                    moduleQuizzes: module.moduleQuizzes || [],
                })) || [],
                courseQuizzes: course.courseQuizzes || [],
            },
            allScores: enrollment.allScores || [],
        };
    },
};

module.exports = enrollHelper;