const quizHelper = {
  formatQuiz: (data, includeAnswers = false) => {
    if (!data) return null;

    const formatted = {
      id: data._id?.toString() || data.id,
      title: data.title,
      description: data.description,
      questions:
        data.questions?.map((q) => ({
          // id: q._1?._id?.toString(),
          id: q._id?.toString() || q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          ...(includeAnswers && { correctAnswer: q.correctAnswer }),
          explanation: includeAnswers ? q.explanation : undefined,
          points: q.points,
          order: q.order,
        })) || [],
      // scope ids (if present)
      courseId: data.courseId
        ? data.courseId._id?.toString
          ? data.courseId._id.toString()
          : data.courseId.toString
          ? data.courseId.toString()
          : data.courseId
        : null,
      moduleId: data.moduleId
        ? data.moduleId._id?.toString
          ? data.moduleId._id.toString()
          : data.moduleId.toString
          ? data.moduleId.toString()
          : data.moduleId
        : null,
      lessonId: data.lessonId
        ? data.lessonId._id?.toString
          ? data.lessonId._id.toString()
          : data.lessonId.toString
          ? data.lessonId.toString()
          : data.lessonId
        : null,
      timeLimit: data.timeLimit,
      passingScore: data.passingScore,
      attemptsAllowed: data.attemptsAllowed,
      randomizeQuestions: data.randomizeQuestions,
      showCorrectAnswers: data.showCorrectAnswers,
      isPublished: data.isPublished,
      createdBy: data.createdBy?._id?.toString() || data.createdBy,
      creatorName: data.createdBy?.username || null,
      totalQuestions: data.questions?.length || 0,
      totalPoints:
        data.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    return formatted;
  },

  formatQuizzes: (quizzes, includeAnswers = false) => {
    if (!Array.isArray(quizzes)) return [];
    return quizzes.map((quiz) => quizHelper.formatQuiz(quiz, includeAnswers));
  },

  randomizeQuestions: (questions) => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
};

module.exports = quizHelper;
