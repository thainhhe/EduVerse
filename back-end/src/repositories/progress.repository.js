// File: repositories/progress.repository.js
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Score = require('../models/Score');
const Enrollment = require('../models/Enrollment');

/**
 * Repository này chịu trách nhiệm tính toán tiến độ khóa học
 * VÀ tính toán điểm số (grade) khi hoàn thành.
 */
const progressRepository = {

    /**
     * HÀM TÍNH TOÁN CHÍNH (Đã nâng cấp để tính Grade)
     */
    calculateUserProgress: async (userId, courseId) => {
        try {
            // --- BƯỚC 1: TÌM MẪU SỐ (Tổng số mục) ---
            const modules = await Module.find({ courseId: courseId }).select('_id').lean();
            const moduleIds = modules.map(m => m._id);

            // 1. Đếm tất cả Lessons (Mục 1)
            const lessons = await Lesson.find({ moduleId: { $in: moduleIds } }).select('_id').lean();
            const lessonIds = lessons.map(l => l._id);
            const totalLessons = lessonIds.length;

            // 2. Đếm Module Quizzes (Mục 2)
            const moduleQuizzes = await Quiz.find({
                moduleId: { $in: moduleIds },
                lessonId: null,
                isPublished: true
            }).select('_id').lean();
            const moduleQuizIds = moduleQuizzes.map(q => q._id);
            const totalModuleQuizzes = moduleQuizIds.length;

            // 3. Đếm Course Quizzes (Mục 3)
            const courseQuizzes = await Quiz.find({
                courseId: courseId,
                moduleId: null,
                lessonId: null,
                isPublished: true
            }).select('_id').lean();
            const courseQuizIds = courseQuizzes.map(q => q._id);
            const totalCourseQuizzes = courseQuizzes.length;

            const totalItems = totalLessons + totalModuleQuizzes + totalCourseQuizzes;

            console.log(`[ProgressRepo] Course ${courseId}: totalItems = ${totalItems} (Lessons: ${totalLessons}, ModuleQuizzes: ${totalModuleQuizzes}, CourseQuizzes: ${totalCourseQuizzes})`);

            // --- BƯỚC 1.5: TÌM TẤT CẢ QUIZ (Để tính điểm) ---
            const lessonQuizzes = await Quiz.find({
                lessonId: { $in: lessonIds },
                isPublished: true
            }).select('_id').lean();
            const lessonQuizIds = lessonQuizzes.map(q => q._id);

            const allQuizIds = [...lessonQuizIds, ...moduleQuizIds, ...courseQuizIds];
            const totalQuizzesInCourse = allQuizIds.length;

            // --- Khởi tạo biến ---
            let progress = 0;
            let status = 'enrolled';
            let grade = 'Incomplete';

            if (totalItems === 0) {
                progress = 100;
                status = 'completed';
                grade = 'Complete';
            } else {
                // --- BƯỚC 2: TÍNH TỬ SỐ (Mục đã hoàn thành) ---
                const completedLessons = await Lesson.countDocuments({
                    _id: { $in: lessonIds },
                    user_completed: userId
                });
                const passedModuleQuizzes = await Score.distinct('quizId', {
                    userId: userId,
                    quizId: { $in: moduleQuizIds },
                    status: "passed"
                });
                const passedCourseQuizzes = await Score.distinct('quizId', {
                    userId: userId,
                    quizId: { $in: courseQuizIds },
                    status: "passed"
                });
                const totalCompletedItems = completedLessons + passedModuleQuizzes.length + passedCourseQuizzes.length;

                console.log(`[ProgressRepo] User ${userId}: completedLessons = ${completedLessons}, completedModuleQuizzes = ${passedModuleQuizzes.length}, completedCourseQuizzes = ${passedCourseQuizzes.length}`);

                // --- BƯỚC 3: TÍNH TOÁN PROGRESS VÀ GRADE ---
                progress = Math.round((totalCompletedItems / totalItems) * 100);

                if (progress >= 100) {
                    progress = 100;
                    status = 'completed';

                    // Bắt đầu tính Grade
                    if (totalQuizzesInCourse === 0) {
                        grade = 'Complete';
                    } else {
                        // ✨ --- BẮT ĐẦU KHỐI CODE SỬA ĐỔI --- ✨
                        // Yêu cầu 2: 100% progress và CÓ quiz

                        // 1. Lấy TẤT CẢ các lần nộp bài (pass và fail)
                        const allAttempts = await Score.find({
                            userId: userId,
                            quizId: { $in: allQuizIds }
                        // ✨ SỬA: Thêm 'status' vào select
                        }).select('quizId percentage attemptNumber status').lean(); 

                        // 2. Dùng Map để tìm điểm (percentage) CỦA LẦN LÀM MỚI NHẤT
                        const latestAttempts = new Map(); // Key: quizId, Value: scoreObject
                        for (const score of allAttempts) {
                            const quizId = score.quizId.toString();
                            const existing = latestAttempts.get(quizId);

                            if (!existing || score.attemptNumber > existing.attemptNumber) {
                                latestAttempts.set(quizId, score); // Lưu cả object
                            }
                        }

                        // 3. Tính trung bình
                        let totalPercentage = 0;
                        for (const score of latestAttempts.values()) {
                            // ✨ SỬA: Chỉ tính điểm nếu lần nộp BÀI MỚI NHẤT là "passed"
                            // (Logic 100% progress đảm bảo tất cả ĐÃ TỪNG passed, 
                            // nhưng user có thể cố tình fail ở lần cuối)
                            if (score.status === 'passed') {
                                totalPercentage += (score.percentage || 0);
                            }
                        }
                        
                        // Chia cho TỔNG SỐ QUIZ, (nếu user pass 2/3 quiz, 
                        // điểm trung bình sẽ là (100+100+0)/3 = 66.6%)
                        const averagePercentage = (totalQuizzesInCourse > 0) ? (totalPercentage / totalQuizzesInCourse) : 0;

                        // ✨ SỬA (Yêu cầu 2): Chuyển sang thang điểm 10
                        const averageGrade10 = (averagePercentage / 10).toFixed(1); // Làm tròn 1 chữ số
                        
                        grade = `${averageGrade10}`; // Lưu dưới dạng String (ví dụ: "9.2", "10.0")
                        // ✨ --- KẾT THÚC KHỐI CODE SỬA ĐỔI --- ✨
                    }
                }
                // (Nếu progress < 100, grade vẫn là 'Incomplete' như mặc định)
            }

            // --- BƯỚC 4: CẬP NHẬT VÀO DB ---
            const updatedEnrollment = await Enrollment.findOneAndUpdate(
                { userId: userId, courseId: courseId },
                {
                    $set: {
                        progress: progress,
                        status: status,
                        grade: grade, // <-- Cập nhật trường grade
                        lastAccessed: Date.now()
                    }
                },
                { new: true }
            );

            console.log(`[ProgressRepo] Updated for User ${userId}: Progress=${progress}%, Status=${status}, Grade=${grade}`);
            return updatedEnrollment;

        } catch (error) {
            console.error('Repository Error - calculateUserProgress:', error);
            throw error;
        }
    }
};

module.exports = progressRepository;