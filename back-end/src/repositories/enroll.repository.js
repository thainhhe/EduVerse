const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Score = require('../models/Score');
const Material = require('../models/Material');
const Quiz = require('../models/Quiz');

const enrollmentRepository = {
    getAllEnrollments: async () => {
        try {
            return await Enrollment.find()
                .populate('userId', 'name username email')
                .populate('courseId', 'title description')
                .exec();
        } catch (error) {
            console.error('Repository Error - getAllEnrollments:', error);
            throw error;
        }
    },

    getEnrollmentById: async (id) => {
        try {
            return await Enrollment.findById(id)
                .populate('userId', 'name username email')
                .populate('courseId', 'title description')
                .exec();
        } catch (error) {
            console.error('Repository Error - getEnrollmentById:', error);
            throw error;
        }
    },

    getEnrollmentByUserAndCourse: async (userId, courseId) => {
        try {
            return await Enrollment.findOne({ userId, courseId }).exec();
        } catch (error) {
            console.error('Repository Error - getEnrollmentByUserAndCourse:', error);
            throw error;
        }
    },

    getAllEnrollmentByUser: async (userId) => {
        try {
            return await Enrollment.find({ userId })
                .populate('userId', 'name username email')
                .populate('courseId', 'title description')
                .exec();
        } catch (error) {
            console.error('Repository Error - getAllEnrollmentByUser:', error);
            throw error;
        }
    },

    createEnrollment: async (data) => {
        try {
            console.log('💾 Repository: Creating enrollment...', data);
            const enrollment = await Enrollment.create(data);
            console.log('✅ Repository: Enrollment created with ID:', enrollment._id);

            // Populate sau khi tạo
            console.log('🔄 Repository: Populating user and course...');
            const populatedEnrollment = await Enrollment.findById(enrollment._id)
                .populate('userId', 'name username email')
                .populate('courseId', 'title description')
                .exec();
            console.log('✅ Repository: Populated successfully:', populatedEnrollment);

            return populatedEnrollment;
        } catch (error) {
            console.error('❌ Repository Error - createEnrollment:', error);
            throw error;
        }
    },

    updateEnrollment: async (id, data) => {
        try {
            return await Enrollment.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true
            })
                .populate('userId', 'name username email')
                .populate('courseId', 'title description')
                .exec();
        } catch (error) {
            console.error('Repository Error - updateEnrollment:', error);
            throw error;
        }
    },

    deleteEnrollment: async (id) => {
        try {
            return await Enrollment.findByIdAndDelete(id)
                .populate('userId', 'name username email')
                .populate('courseId', 'title description')
                .exec();
        } catch (error) {
            console.error('Repository Error - deleteEnrollment:', error);
            throw error;
        }
    },

    getDetailedEnrollmentByUser: async (userId) => {
        try {
            // 1️⃣ Lấy enrollment và populate course
            const enrollments = await Enrollment.find({ userId })
                .populate({
                    path: "courseId",
                    populate: [
                        { path: "main_instructor", select: "name email" },
                        { path: "instructors.id", select: "name email" },
                        { path: "category" },
                    ],
                })
                .populate("userId", "name username email")
                .lean();

            if (!enrollments.length) {
                console.log(`No enrollments found for userId: ${userId}`);
                return [];
            }

            // 2️⃣ Lấy tất cả courseId từ enrollment
            const courseIds = enrollments
                .map((e) => e.courseId?._id?.toString())
                .filter(Boolean);

            if (!courseIds.length) {
                console.log("No valid course IDs found in enrollments");
                return enrollments;
            }

            // 3️⃣ Lấy tất cả modules trong course
            const modules = await Module.find({ courseId: { $in: courseIds } }).lean();
            const moduleIds = modules.map((m) => m._id?.toString()).filter(Boolean);

            if (!moduleIds.length) {
                console.log("No modules found for courses:", courseIds);
            }

            // 4️⃣ Lấy lessons + populate quiz + materials
            const lessons = await Lesson.find({ moduleId: { $in: moduleIds } })
                .populate({
                    path: "materials",
                    populate: { path: "uploadedBy", select: "name email role" },
                })
                .populate({
                    path: "quiz",
                    select: "title passingScore questions", // Populate các trường cần thiết
                })
                .lean();

            // Log để kiểm tra dữ liệu lesson sau populate
            console.log("Lessons after populate:", JSON.stringify(lessons, null, 2));

            // 5️⃣ Lấy quizIds từ lessons và course-level quizzes
            const lessonQuizIds = lessons
                .map((l) => l.quiz?._id?.toString())
                .filter(Boolean);

            // Lấy các quiz ở cấp độ khóa học
            const courseQuizzes = await Quiz.find({
                courseId: { $in: courseIds },
                moduleId: null,
                lessonId: null,
            })
                .select("title passingScore questions")
                .lean();

            const courseQuizIds = courseQuizzes.map((q) => q._id?.toString()).filter(Boolean);
            const allQuizIds = [...new Set([...lessonQuizIds, ...courseQuizIds])];

            if (!allQuizIds.length) {
                console.log("No quiz IDs found for lessons or courses");
            }

            // 6️⃣ Lấy điểm số (score) của user
            const scores = await Score.find({
                userId,
                quizId: { $in: allQuizIds },
            })
                .populate("quizId", "title passingScore")
                .lean();

            // Gom score theo quizId và attemptNumber để tránh trùng lặp
            const scoresByQuiz = {};
            scores.forEach((s) => {
                if (s.quizId?._id) {
                    const key = `${s.quizId._id.toString()}_${s.attemptNumber || 1}`;
                    scoresByQuiz[key] = s;
                }
            });

            // 7️⃣ Gắn quizScores vào lesson
            lessons.forEach((lesson) => {
                if (lesson.quiz?._id) {
                    const quizId = lesson.quiz._id.toString();
                    lesson.quizScores = Object.values(scoresByQuiz).filter(
                        (s) => s.quizId?._id?.toString() === quizId
                    );
                } else {
                    lesson.quizScores = [];
                }
            });

            // 8️⃣ Gom lessons theo moduleId
            const lessonsByModule = {};
            lessons.forEach((l) => {
                const mid = l.moduleId?.toString();
                if (mid) {
                    if (!lessonsByModule[mid]) lessonsByModule[mid] = [];
                    lessonsByModule[mid].push(l);
                }
            });

            // 9️⃣ Gắn lessons vào modules
            modules.forEach((m) => {
                m.lessons = lessonsByModule[m._id?.toString()] || [];
            });

            // 🔟 Gom modules theo courseId
            const modulesByCourse = {};
            modules.forEach((m) => {
                const cid = m.courseId?.toString();
                if (cid) {
                    if (!modulesByCourse[cid]) modulesByCourse[cid] = [];
                    modulesByCourse[cid].push(m);
                }
            });

            // 11️⃣ Gắn courseQuizzes vào course
            const courseQuizzesByCourse = {};
            courseQuizzes.forEach((q) => {
                const cid = q.courseId?.toString();
                if (cid) {
                    if (!courseQuizzesByCourse[cid]) courseQuizzesByCourse[cid] = [];
                    const quizId = q._id?.toString();
                    courseQuizzesByCourse[cid].push({
                        ...q,
                        quizScores: Object.values(scoresByQuiz).filter(
                            (s) => s.quizId?._id?.toString() === quizId
                        ),
                    });
                }
            });

            // 12️⃣ Tổng hợp kết quả cho từng enrollment
            const result = enrollments.map((en) => {
                const course = en.courseId || {};
                const courseModules = modulesByCourse[course?._id?.toString()] || [];

                // Gom tất cả quizScores trong course
                const allLessons = courseModules.flatMap((m) => m.lessons || []);
                const allLessonScores = allLessons.flatMap((l) => l.quizScores || []);
                const courseQuizScores = (courseQuizzesByCourse[course?._id?.toString()] || []).flatMap(
                    (q) => q.quizScores || []
                );

                const totalQuizzes =
                    allLessons.filter((l) => l.quiz?._id).length +
                    (courseQuizzesByCourse[course?._id?.toString()]?.length || 0);
                const completedQuizzes =
                    allLessonScores.filter((s) => s.status === "passed").length +
                    courseQuizScores.filter((s) => s.status === "passed").length;
                const allScores = [...new Set([...allLessonScores, ...courseQuizScores].map((s) => JSON.stringify(s)))].map(
                    (s) => JSON.parse(s)
                ); // Loại bỏ trùng lặp
                const averageScore =
                    allScores.length > 0
                        ? Math.round(allScores.reduce((acc, s) => acc + (s.percentage || 0), 0) / allScores.length)
                        : 0;

                const calculatedProgress =
                    totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;

                // Gắn modules và courseQuizzes vào course
                course.modules = courseModules;
                course.courseQuizzes = courseQuizzesByCourse[course?._id?.toString()] || [];

                return {
                    _id: en._id,
                    userId: en.userId,
                    enrollmentDate: en.enrollmentDate,
                    progress: en.progress || 0,
                    status: en.status || "enrolled",
                    calculatedProgress,
                    totalQuizzes,
                    completedQuizzes,
                    averageScore,
                    courseId: course,
                    allScores,
                };
            });

            return result;
        } catch (error) {
            console.error("Repository Error - getDetailedEnrollmentByUser:", {
                message: error.message,
                stack: error.stack,
                userId,
            });
            throw error;
        }
    },

};

module.exports = enrollmentRepository;