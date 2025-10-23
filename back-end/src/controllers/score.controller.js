const GradeCalculatorService = require('../services/gradeCalculator.services.js');
const Score = require('../models/Score');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');

// Nộp bài quiz và tính điểm
const submitQuiz = async (req, res) => {
    try {
        const { userId, quizId, answers, timeTaken } = req.body;
        
        // Validate
        if (!userId || !quizId || !answers) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }
        
        // Take quiz
        const quiz = await Quiz.findById(quizId).populate({
            path: 'lessonId',
            populate: {
                path: 'moduleId',
                select: 'courseId'
            }
        });
        
        if (!quiz || !quiz.isPublished) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Check số lần làm quiz
        const attempts = await Score.countDocuments({ userId, quizId });
        if (attempts >= quiz.attemptsAllowed) {
            return res.status(400).json({
                error: 'Maximum attempts reached'
            });
        }
        
        // Tính điểm
        let totalPoints = 0;
        let earnedPoints = 0;
        
        quiz.questions.forEach((question, index) => {
            totalPoints += question.points;
            if (answers[index] === question.correctAnswer) {
                earnedPoints += question.points;
            }
        });
        
        const scoreOutOf10 = (earnedPoints / totalPoints) * 10;
        const passingScore = (quiz.passingScore / 100) * 10;
        const status = scoreOutOf10 >= passingScore ? 'passed' : 'failed';

        // Lưu điểm
        const newScore = await Score.create({
            userId,
            quizId,
            score: scoreOutOf10,
            timeTaken,
            status
        });
        
        // Cập nhật grade trong enrollment
        const courseId = quiz.lessonId.moduleId.courseId;
        const gradeResult = await GradeCalculatorService.updateEnrollmentGrade(userId, courseId);
        
        res.json({ 
            score: newScore,
            grade: gradeResult.grade,
            averageScore: gradeResult.averageScore
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy điểm của user trong 1 quiz
const getQuizScores = async (req, res) => {
    try {
        const { userId, quizId } = req.params;
        
        const scores = await Score.find({ userId, quizId })
            .sort({ dateSubmitted: -1 });
        
        res.json({ scores });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy tất cả điểm quiz của user trong course
const getCourseScores = async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        
        // Lấy tất cả quiz IDs
        const quizIds = await GradeCalculatorService.getQuizIdsFromCourse(courseId);
        
        // Lấy điểm
        const scores = await Score.find({
            userId,
            quizId: { $in: quizIds }
        })
        .populate('quizId', 'title')
        .sort({ dateSubmitted: -1 });
        
        res.json({ 
            totalQuizzes: quizIds.length,
            scores 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    submitQuiz,
    getQuizScores,
    getCourseScores
};
