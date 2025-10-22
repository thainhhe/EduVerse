const Enrollment = require('./models/Enrollment');
const Score = require('./models/Score');
const Quiz = require('./models/Quiz');
const Lesson = require('./models/Lesson');
const Module = require('./models/Module');

class GradeCalculatorService {

    static convertScoreToGrade(averageScore) {
        if (averageScore >= 8.5) return 'A';
        if (averageScore >= 7.0) return 'B';
        if (averageScore >= 5.5) return 'C';
        if (averageScore >= 4.0) return 'D';
        return 'F';
    }

    /**
     * Get all quiz IDs of a course
     */
    static async getQuizIdsFromCourse(courseId) {
        // Step 1: Get all modules of the course
        const modules = await Module.find({ courseId }).select('_id');

        if (modules.length === 0) {
            return []; // Course has no modules
        }

        const moduleIds = modules.map(m => m._id);

        // Step 2: Get all lessons of type 'quiz' from these modules
        const quizLessons = await Lesson.find({
            moduleId: { $in: moduleIds },
            type: 'quiz'
        }).select('_id');

        if (quizLessons.length === 0) {
            return []; // No quiz lessons found
        }

        const quizLessonIds = quizLessons.map(l => l._id);

        // Step 3: Get all quiz documents linked to these quiz lessons
        const quizzes = await Quiz.find({
            lessonId: { $in: quizLessonIds },
            isPublished: true // Only get published quizzes
        }).select('_id');

        return quizzes.map(q => q._id);
    }

    /**
     * Calculate the average score of a user in a course
     */
    static async calculateAverageScore(userId, courseId) {
        // Get all quiz IDs of the course
        const quizIds = await this.getQuizIdsFromCourse(courseId);

        if (quizIds.length === 0) {
            return null; // No quizzes found
        }

        // Get the latest score of each quiz
        const scores = await Score.aggregate([
            {
                $match: {
                    userId: userId,
                    quizId: { $in: quizIds }
                }
            },
            {
                $sort: { dateSubmitted: -1 } // Sort by latest submission date
            },
            {
                $group: {
                    _id: '$quizId',
                    latestScore: { $first: '$score' } // Get the score of the latest submission
                }
            }
        ]);

        if (scores.length === 0) {
            return null; // User has not taken any quizzes
        }

        // Calculate average score
        const totalScore = scores.reduce((sum, item) => sum + item.latestScore, 0);
        const averageScore = totalScore / scores.length;

        return averageScore;
    }

    /**
     * Update the grade for a enrollment
     */
    static async updateEnrollmentGrade(userId, courseId) {
        try {
            // Calculate average score
            const averageScore = await this.calculateAverageScore(userId, courseId);

            // If no score, keep "Incomplete"
            if (averageScore === null) {
                return {
                    success: true,
                    grade: 'Incomplete',
                    averageScore: null,
                    message: 'No quiz scores found'
                };
            }

            // Convert to grade
            const grade = this.convertScoreToGrade(averageScore);

            // Update enrollment
            const enrollment = await Enrollment.findOneAndUpdate(
                { userId, courseId },
                { grade },
                { new: true }
            );

            if (!enrollment) {
                throw new Error('Enrollment not found');
            }

            return {
                success: true,
                grade,
                averageScore: averageScore.toFixed(2),
                enrollment
            };
        } catch (error) {
            console.error('Error updating enrollment grade:', error);
            throw error;
        }
    }

    /**
     * Update the grades for all enrollments of a user
     */
    static async updateAllGradesForUser(userId) {
        try {
            const enrollments = await Enrollment.find({ userId });

            const results = await Promise.all(
                enrollments.map(enrollment =>
                    this.updateEnrollmentGrade(userId, enrollment.courseId)
                )
            );

            return results;
        } catch (error) {
            console.error('Error updating all grades for user:', error);
            throw error;
        }
    }

    /**
     * Update the grades for all users in a course
     */
    static async updateAllGradesForCourse(courseId) {
        try {
            const enrollments = await Enrollment.find({ courseId });

            const results = await Promise.all(
                enrollments.map(enrollment =>
                    this.updateEnrollmentGrade(enrollment.userId, courseId)
                )
            );

            return results;
        } catch (error) {
            console.error('Error updating all grades for course:', error);
            throw error;
        }
    }
}

module.exports = GradeCalculatorService;