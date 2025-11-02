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

            // 4️⃣ Lấy lessons + populate materials (BỎ populate quiz vì không có field này)
            const lessons = await Lesson.find({ moduleId: { $in: moduleIds } })
                .populate({
                    path: "materials",
                    populate: { path: "uploadedBy", select: "name email role" },
                })
                .lean();

            console.log("Lessons after populate:", JSON.stringify(lessons, null, 2));

            // 5️⃣ Lấy tất cả lessonIds
            const lessonIds = lessons.map((l) => l._id?.toString()).filter(Boolean);

            // Lấy quiz ở cấp lesson
            const lessonQuizzes = await Quiz.find({
                lessonId: { $in: lessonIds },
            })
                .select("title passingScore questions lessonId")
                .lean();

            // Lấy quiz ở cấp module
            const moduleQuizzes = await Quiz.find({
                moduleId: { $in: moduleIds },
                lessonId: null,
            })
                .select("title passingScore questions moduleId")
                .lean();

            // Lấy quiz ở cấp course
            const courseQuizzes = await Quiz.find({
                courseId: { $in: courseIds },
                moduleId: null,
                lessonId: null,
            })
                .select("title passingScore questions courseId")
                .lean();

            console.log("Lesson Quizzes found:", lessonQuizzes.length);
            console.log("Module Quizzes found:", moduleQuizzes.length);
            console.log("Course Quizzes found:", courseQuizzes.length);

            // Gom tất cả quiz IDs
            const allQuizIds = [
                ...lessonQuizzes.map(q => q._id.toString()),
                ...moduleQuizzes.map(q => q._id.toString()),
                ...courseQuizzes.map(q => q._id.toString())
            ].filter(Boolean);

            if (!allQuizIds.length) {
                console.log("No quiz IDs found for lessons, modules, or courses");
            }

            // 6️⃣ Lấy điểm số (score) của user
            const scores = await Score.find({
                userId,
                quizId: { $in: allQuizIds },
            })
                .populate("quizId", "title passingScore")
                .lean();

            console.log("Scores found:", scores.length);

            // Gom score theo quizId và attemptNumber để tránh trùng lặp
            const scoresByQuiz = {};
            scores.forEach((s) => {
                if (s.quizId?._id) {
                    const key = `${s.quizId._id.toString()}_${s.attemptNumber || 1}`;
                    scoresByQuiz[key] = s;
                }
            });

            // 7️⃣ Gắn quiz và scores vào lesson
            const quizByLesson = {};
            lessonQuizzes.forEach(q => {
                const lessonId = q.lessonId?.toString();
                if (lessonId) {
                    if (!quizByLesson[lessonId]) quizByLesson[lessonId] = [];
                    const quizId = q._id.toString();
                    quizByLesson[lessonId].push({
                        ...q,
                        quizScores: Object.values(scoresByQuiz).filter(
                            (s) => s.quizId?._id?.toString() === quizId
                        ),
                    });
                }
            });

            lessons.forEach((lesson) => {
                const lessonId = lesson._id?.toString();
                lesson.quizzes = quizByLesson[lessonId] || [];
            });

            // 8️⃣ Gắn quiz vào module
            const quizByModule = {};
            moduleQuizzes.forEach(q => {
                const moduleId = q.moduleId?.toString();
                if (moduleId) {
                    if (!quizByModule[moduleId]) quizByModule[moduleId] = [];
                    const quizId = q._id.toString();
                    quizByModule[moduleId].push({
                        ...q,
                        quizScores: Object.values(scoresByQuiz).filter(
                            (s) => s.quizId?._id?.toString() === quizId
                        ),
                    });
                }
            });

            // 9️⃣ Gom lessons theo moduleId
            const lessonsByModule = {};
            lessons.forEach((l) => {
                const mid = l.moduleId?.toString();
                if (mid) {
                    if (!lessonsByModule[mid]) lessonsByModule[mid] = [];
                    lessonsByModule[mid].push(l);
                }
            });

            // 🔟 Gắn lessons và moduleQuizzes vào modules
            modules.forEach((m) => {
                const moduleId = m._id?.toString();
                m.lessons = lessonsByModule[moduleId] || [];
                m.moduleQuizzes = quizByModule[moduleId] || [];
            });

            // 11️⃣ Gom modules theo courseId
            const modulesByCourse = {};
            modules.forEach((m) => {
                const cid = m.courseId?.toString();
                if (cid) {
                    if (!modulesByCourse[cid]) modulesByCourse[cid] = [];
                    modulesByCourse[cid].push(m);
                }
            });

            // 12️⃣ Gắn courseQuizzes với scores
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

            // 13️⃣ Tổng hợp kết quả cho từng enrollment
            const result = enrollments.map((en) => {
                const course = en.courseId || {};
                const courseModules = modulesByCourse[course?._id?.toString()] || [];

                // Gom tất cả quizzes và scores trong course
                const allLessons = courseModules.flatMap((m) => m.lessons || []);
                const allLessonQuizzes = allLessons.flatMap((l) => l.quizzes || []);
                const allModuleQuizzes = courseModules.flatMap((m) => m.moduleQuizzes || []);
                const courseQuizList = courseQuizzesByCourse[course?._id?.toString()] || [];

                const allLessonScores = allLessonQuizzes.flatMap((q) => q.quizScores || []);
                const allModuleScores = allModuleQuizzes.flatMap((q) => q.quizScores || []);
                const courseQuizScores = courseQuizList.flatMap((q) => q.quizScores || []);

                const totalQuizzes = allLessonQuizzes.length + allModuleQuizzes.length + courseQuizList.length;
                const completedQuizzes =
                    allLessonScores.filter((s) => s.status === "passed").length +
                    allModuleScores.filter((s) => s.status === "passed").length +
                    courseQuizScores.filter((s) => s.status === "passed").length;

                const allScores = [...allLessonScores, ...allModuleScores, ...courseQuizScores];
                const uniqueScores = [...new Set(allScores.map((s) => JSON.stringify(s)))].map((s) =>
                    JSON.parse(s)
                );
                const averageScore =
                    uniqueScores.length > 0
                        ? Math.round(
                              uniqueScores.reduce((acc, s) => acc + (s.percentage || 0), 0) /
                                  uniqueScores.length
                          )
                        : 0;

                const calculatedProgress =
                    totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;

                // Gắn modules và courseQuizzes vào course
                course.modules = courseModules;
                course.courseQuizzes = courseQuizList;

                console.log(`Course ${course._id}: Total Quizzes = ${totalQuizzes}, Completed = ${completedQuizzes}`);

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
                    allScores: uniqueScores,
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


    // Calculate and update user progress in a course
    calculateUserProgress: async (userId, courseId) => {
        try {
            console.log(`Calculating progress for user ${userId} in course ${courseId}`);

            //Lấy tất cả modules của course
            const modules = await Module.find({ courseId }).lean();
            const moduleIds = modules.map(m => m._id.toString());

            if (!moduleIds.length) {
                console.log('No modules found for this course');
                return { progress: 0, totalLessons: 0, completedLessons: 0 };
            }

            // Lấy tất cả lessons của các modules
            const lessons = await Lesson.find({ 
                moduleId: { $in: moduleIds } 
            }).select('_id user_completed').lean();

            const totalLessons = lessons.length;

            if (totalLessons === 0) {
                console.log('No lessons found in this course');
                return { progress: 0, totalLessons: 0, completedLessons: 0 };
            }

            // Đếm số lessons mà user đã complete
            const completedLessons = lessons.filter(lesson => 
                lesson.user_completed.some(id => id.toString() === userId.toString())
            ).length;

            // Tính % progress
            const progress = Math.round((completedLessons / totalLessons) * 100);

            console.log(`✅ Progress calculated: ${completedLessons}/${totalLessons} = ${progress}%`);

            // Update progress vào enrollment
            const updatedEnrollment = await Enrollment.findOneAndUpdate(
                { userId, courseId },
                { 
                    progress,
                    lastAccessed: new Date(),
                    // Nếu hoàn thành 100% thì update status
                    ...(progress === 100 && { status: 'completed' })
                },
                { new: true }
            ).populate('userId', 'name username email')
             .populate('courseId', 'title description');

            if (!updatedEnrollment) {
                throw new Error('Enrollment not found');
            }

            return {
                progress,
                totalLessons,
                completedLessons,
                enrollment: updatedEnrollment
            };

        } catch (error) {
            console.error('Repository Error - calculateUserProgress:', error);
            throw error;
        }
    },

    getEnrollmentByUserAndCourse: async (userId, courseId) => {
        try {
            const enrollment = await Enrollment.findOne({ userId, courseId });
            return enrollment;
        } catch (error) {
            console.error('Repository Error - getEnrollmentByUserAndCourse:', error);
            throw error;
        }
    }

};

module.exports = enrollmentRepository;