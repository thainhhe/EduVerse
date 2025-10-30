const scoreHelper = {
    formatScore: (data) => {
        if (!data) return null;

        return {
            id: data._id?.toString() || data.id,
            userId: data.userId?._id?.toString() || data.userId,
            username: data.userId?.username || null,
            userEmail: data.userId?.email || null,
            quizId: data.quizId?._id?.toString() || data.quizId,
            quizTitle: data.quizId?.title || null,
            score: data.score,
            totalPoints: data.totalPoints,
            percentage: data.percentage,
            answers: data.answers?.map((a) => ({
                questionId: a.questionId?.toString(),
                userAnswer: a.userAnswer,
                isCorrect: a.isCorrect,
                pointsEarned: a.pointsEarned,
            })) || [],
            timeTaken: data.timeTaken,
            attemptNumber: data.attemptNumber,
            dateSubmitted: data.dateSubmitted,
            remarks: data.remarks,
            status: data.status,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },

    formatScores: (scores) => {
        if (!Array.isArray(scores)) return [];
        return scores.map((score) => scoreHelper.formatScore(score));
    },

    calculateScore: (quiz, userAnswers) => {
        let totalScore = 0;
        let totalPoints = 0;
        const answers = [];

        quiz.questions.forEach((question) => {
            totalPoints += question.points || 0;

            const userAnswer = userAnswers.find(
                (a) => a.questionId.toString() === question._id.toString()
            );

            if (!userAnswer) {
                answers.push({
                    questionId: question._id,
                    userAnswer: [],
                    isCorrect: false,
                    pointsEarned: 0,
                });
                return;
            }

            const correctAnswers = question.correctAnswer.sort();
            const submittedAnswers = userAnswer.userAnswer.sort();

            const isCorrect =
                correctAnswers.length === submittedAnswers.length &&
                correctAnswers.every((ans, idx) => ans === submittedAnswers[idx]);

            const pointsEarned = isCorrect ? question.points : 0;
            totalScore += pointsEarned;

            answers.push({
                questionId: question._id,
                userAnswer: userAnswer.userAnswer,
                isCorrect,
                pointsEarned,
            });
        });

        const percentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
        const status = percentage >= quiz.passingScore ? "passed" : "failed";

        return {
            score: totalScore,
            totalPoints,
            percentage,
            answers,
            status,
        };
    },
};

module.exports = scoreHelper;