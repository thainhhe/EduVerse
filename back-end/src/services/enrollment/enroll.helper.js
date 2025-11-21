const enrollHelper = {
  formatEnrollment: (data) => {
    if (!data) return null;
    console.log("data", data);
    return {
      id: data._id?.toString() || data.id,
      userId: data.userId?._id?.toString() || data.userId,
      userName: data.userId?.name || data.userId?.username || null,
      courseId: data.courseId?._id?.toString() || data.courseId,
      thumbnail: data.courseId?.thumbnail || null,
      thumbnail: data.courseId?.thumbnail || null,
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
    return enrollments.map((enrollment) =>
      enrollHelper.formatEnrollment(enrollment)
    );
  },

  formatDetailedEnrollment: (enrollment) => {
    const course = enrollment.courseId || {};
    const userId = enrollment.userId?._id?.toString();

    const totalLessons =
      course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) ||
      0;
    const completedLessons =
      course.modules?.reduce(
        (sum, m) =>
          sum +
          (m.lessons?.filter((l) =>
            l.user_completed?.some((u) => u._id?.toString() === userId)
          ).length || 0),
        0
      ) || 0;

    // const calculatedProgress =
    //   totalLessons > 0
    //     ? Math.round((completedLessons / totalLessons) * 100)
    //     : 0;
    // formatDetailedEnrollment: (enrollment) => {
    //     const course = enrollment.courseId || {};
    //     const userId = enrollment.userId?._id?.toString();

    //   return {
    //     _id: enrollment._id?.toString(),
    //     userId: enrollment.userId,
    //     enrollmentDate: enrollment.enrollmentDate,
    //     progress: enrollment.progress || 0,
    //     status: enrollment.status || "enrolled",
    //     calculatedProgress,
    //     totalQuizzes: enrollment.totalQuizzes || 0,
    //     completedQuizzes: enrollment.completedQuizzes || 0,
    //     averageScore: enrollment.averageScore || 0,
    //     courseId: {
    //       ...course,
    //       modules:
    //         course.modules?.map((module) => ({
    //           ...module,
    //           lessons:
    //             module.lessons?.map((lesson) => ({
    //               ...lesson,
    //               quiz: lesson.quiz || null, // Đảm bảo quiz được bao gồm
    //               quizScores: lesson.quizScores || [],
    //             })) || [],
    //         })) || [],
    //       courseQuizzes: course.courseQuizzes || [],
    //     },
    //     allScores: enrollment.allScores || [],
    //   };
    // },
    return {
      _id: enrollment._id?.toString(),
      userId: enrollment.userId,
      enrollmentDate: enrollment.enrollmentDate,
      progress: enrollment.progress || 0,
      status: enrollment.status || "enrolled",
      grade: enrollment.grade || "Incomplete",
      totalQuizzes: enrollment.totalQuizzes || 0,
      completedQuizzes: enrollment.completedQuizzes || 0,
      averageScore: enrollment.averageScore || 0,

      courseId: {
        ...course,
        modules:
          course.modules?.map((module) => ({
            ...module,
            lessons:
              module.lessons?.map((lesson) => ({
                ...lesson,
                isCompleted: lesson.user_completed?.some(
                  (id) => id.toString() === userId
                ),
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
