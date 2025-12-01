const Course = require("../../models/Course");
const Review = require("../../models/Review");
const Module = require("../../models/Module");
const Lesson = require("../../models/Lesson");
const Material = require("../../models/Material");
const Quiz = require("../../models/Quiz");
const Enrollment = require("../../models/Enrollment");
const Forum = require("../../models/Forum");
const { STATUS_CODE } = require("../../config/enum/system.constant");

const courseManagementRepository = {
    getAllCourses: async () => {
        const reviews = await Review.find();
        const averageRatings = {};

        reviews.forEach((review) => {
            if (!averageRatings[review.course]) {
                averageRatings[review.course] = {
                    totalRating: 0,
                    numberOfReviews: 0,
                };
            }
            averageRatings[review.course].totalRating += review.rating;
            averageRatings[review.course].numberOfReviews++;
        });

        for (const courseId in averageRatings) {
            averageRatings[courseId].averageRating =
                averageRatings[courseId].totalRating / averageRatings[courseId].numberOfReviews;
        }

        const courses = await Course.find()
            .populate("category")
            .populate("main_instructor", "username email")
            .populate("instructors.user", "username email")
            .populate("instructors.permission")
            .populate("category")
            .exec();
        return courses.map((course) => {
            const courseObj = course.toObject();
            courseObj.averageRating = averageRatings[course._id]?.averageRating || 0;
            return courseObj;
        });
    },

    //get a course details with all populated fields: modules, lessons, materials, quizzes, reviews, enrollments
    getCourseDetailsById: async (courseId) => {
        try {
            // 1️⃣ Lấy course với các thông tin cơ bản
            const course = await Course.findById(courseId)
                .populate("category")
                .populate("main_instructor", "username email")
                .populate("instructors.user", "username email")
                .lean();

            if (!course) return null;

            const courseIdStr = course._id.toString();

            // 2️⃣ Lấy modules
            const modules = await Module.find({ courseId: courseIdStr }).lean();
            const moduleIds = modules.map((m) => m._id?.toString()).filter(Boolean);

            // 3️⃣ Lấy lessons cho các modules (không populate materials)
            const lessons = await Lesson.find({
                moduleId: { $in: moduleIds },
            }).lean();
            const lessonIds = lessons.map((l) => l._id?.toString()).filter(Boolean);

            // 4️⃣ Lấy materials cho lessons
            const materials = await Material.find({ lessonId: { $in: lessonIds } })
                .populate({ path: "uploadedBy", select: "username email role" })
                .lean();

            // Gom materials theo lessonId
            const materialsByLesson = {};
            materials.forEach((mat) => {
                const lid = mat.lessonId?.toString();
                if (lid) {
                    if (!materialsByLesson[lid]) materialsByLesson[lid] = [];
                    materialsByLesson[lid].push(mat);
                }
            });

            // 5️⃣ Lấy quizzes cho lesson, module, course
            const lessonQuizzes = await Quiz.find({
                lessonId: { $in: lessonIds },
            }).lean();
            const moduleQuizzes = await Quiz.find({
                moduleId: { $in: moduleIds },
                lessonId: null,
            }).lean();
            const courseQuizzes = await Quiz.find({
                courseId: courseIdStr,
                moduleId: null,
                lessonId: null,
            }).lean();

            // 6️⃣ Gom quizzes theo lessonId
            const quizByLesson = {};
            lessonQuizzes.forEach((q) => {
                const lid = q.lessonId?.toString();
                if (lid) {
                    if (!quizByLesson[lid]) quizByLesson[lid] = [];
                    quizByLesson[lid].push(q);
                }
            });

            // 7️⃣ Gắn quizzes và materials vào lessons
            lessons.forEach((lesson) => {
                const lid = lesson._id?.toString();
                lesson.quizzes = quizByLesson[lid] || [];
                lesson.materials = materialsByLesson[lid] || [];
            });

            // 8️⃣ Gom quizzes theo module
            const quizByModule = {};
            moduleQuizzes.forEach((q) => {
                const mid = q.moduleId?.toString();
                if (mid) {
                    if (!quizByModule[mid]) quizByModule[mid] = [];
                    quizByModule[mid].push(q);
                }
            });

            // 9️⃣ Gom lessons theo module và attach quizzes module
            const lessonsByModule = {};
            lessons.forEach((l) => {
                const mid = l.moduleId?.toString();
                if (mid) {
                    if (!lessonsByModule[mid]) lessonsByModule[mid] = [];
                    lessonsByModule[mid].push(l);
                }
            });

            modules.forEach((m) => {
                const mid = m._id?.toString();
                m.lessons = lessonsByModule[mid] || [];
                m.moduleQuizzes = quizByModule[mid] || [];
            });

            // 10️⃣ Gắn quizzes cấp course
            course.courseQuizzes = courseQuizzes;

            // 11️⃣ Lấy reviews
            const reviews = await Review.find({ courseId: courseIdStr })
                .populate("userId", "username email")
                .sort({ createdAt: -1 })
                .lean();
            const totalReviews = reviews.length;
            const averageRating = totalReviews
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                : 0;

            // 12️⃣ Tổng số enrollments
            const totalEnrollments = await Enrollment.countDocuments({
                courseId: courseIdStr,
            });

            // 13️⃣ Trả về course chi tiết
            return {
                ...course,
                modules,
                reviews,
                averageRating: parseFloat(averageRating.toFixed(2)),
                totalReviews,
                totalEnrollments,
            };
        } catch (err) {
            console.error("❌ Error in getCourseDetailsById:", err);
            throw err;
        }
    },

    // ✅ Approve course and publish all related quizzes + create/update forum
    approveCourse: async (courseId) => {
        try {
            console.log(`✅ Approving course ${courseId}...`);

            // 1️⃣ Cập nhật trạng thái khóa học
            const course = await Course.findByIdAndUpdate(
                courseId,
                {
                    status: "approve",
                    isPublished: true,
                    reasonReject: "",
                },
                { new: true }
            )
                // <-- 🚀 BỔ SUNG: Populate main_instructor để gửi mail
                .populate("main_instructor", "email username")
                .exec();

            if (!course) throw new Error("Course not found");

            // 2️⃣ Lấy modules và lessons liên quan (Giữ nguyên logic của bạn)
            const modules = await Module.find({ courseId }).exec();
            console.log("modules", modules);
            const moduleIds = modules.map((m) => m._id);
            const lessons = await Lesson.find({
                moduleId: { $in: moduleIds },
            }).exec();
            const lessonIds = lessons.map((l) => l._id);

            // 3️⃣ Publish tất cả quiz liên quan (Giữ nguyên logic của bạn)
            const [courseQuiz, moduleQuiz, lessonQuiz] = await Promise.all([
                Quiz.updateMany({ courseId }, { isPublished: true }),
                Quiz.updateMany({ moduleId: { $in: moduleIds } }, { isPublished: true }),
                Quiz.updateMany({ lessonId: { $in: lessonIds } }, { isPublished: true }),
            ]);

            // 4️⃣ Tạo hoặc cập nhật forum (Giữ nguyên logic của bạn)
            const existingForum = await Forum.findOne({ courseId });
            if (!existingForum) {
                const newForum = await Forum.create({
                    title: course.title || "Diễn đàn khóa học",
                    description: `Diễn đàn thảo luận cho khóa học "${course.title}"`,
                    courseId,
                    isPublic: true,
                });
                console.log(`🗨️ Forum created for course ${course._id}: ${newForum._id}`);
            } else {
                await Forum.findByIdAndUpdate(existingForum._id, { isPublic: true });
                console.log(`🔄 Forum updated to public for course ${courseId}`);
            }

            console.log("🎉 Course approved successfully!");

            // <-- 🚀 THAY ĐỔI: Trả về dữ liệu thô để Service xử lý
            // Service của bạn (từ tin nhắn trước) đang mong đợi cấu trúc này
            return {
                course: course, // 'course' này đã được populate
                quizzesPublished: {
                    courseLevel: courseQuiz.modifiedCount,
                    moduleLevel: moduleQuiz.modifiedCount,
                    lessonLevel: lessonQuiz.modifiedCount,
                    total: courseQuiz.modifiedCount + moduleQuiz.modifiedCount + lessonQuiz.modifiedCount,
                },
            };
        } catch (error) {
            console.error("Repository Error - approveCourse:", error);
            throw error; // Ném lỗi để Service ở trên bắt được
        }
    },

    // ❌ Reject course -> unpublish quizzes + hide forum
    rejectCourse: async (courseId, reasonReject) => {
        try {
            console.log(`❌ Rejecting course ${courseId}...`);

            // 1️⃣ Cập nhật trạng thái khóa học
            const course = await Course.findByIdAndUpdate(
                courseId,
                {
                    status: "reject",
                    isPublished: false,
                    reasonReject: reasonReject || "Khóa học không đạt yêu cầu",
                },
                { new: true }
            )
                // <-- 🚀 BỔ SUNG: Populate main_instructor để gửi mail
                .populate("main_instructor", "email username")
                .exec();

            if (!course) throw new Error("Course not found");

            // 2️⃣ Lấy module và lesson của khóa học (Giữ nguyên logic của bạn)
            const modules = await Module.find({ courseId }).exec();
            const moduleIds = modules.map((m) => m._id);
            const lessons = await Lesson.find({
                moduleId: { $in: moduleIds },
            }).exec();
            const lessonIds = lessons.map((l) => l._id);

            // 3️⃣ Unpublish tất cả quiz liên quan (Giữ nguyên logic của bạn)
            await Quiz.updateMany(
                {
                    $or: [{ courseId }, { moduleId: { $in: moduleIds } }, { lessonId: { $in: lessonIds } }],
                },
                { isPublished: false }
            ).exec();

            // 4️⃣ Cập nhật forum -> ẩn đi thay vì xóa (Giữ nguyên logic của bạn)
            const existingForum = await Forum.findOne({ courseId });
            if (existingForum) {
                await Forum.findByIdAndUpdate(existingForum._id, { isPublic: false });
                console.log(`🚫 Forum set to private for rejected course ${courseId}`);
            } else {
                console.log(`ℹ️ No forum found for rejected course ${courseId}`);
            }

            console.log("✅ Course rejected and forum hidden (if existed).");

            // <-- 🚀 THAY ĐỔI: Trả về 'course' object đã populate
            // Service của bạn đang mong đợi nhận trực tiếp 'course' object
            return course;
        } catch (error) {
            console.error("Repository Error - rejectCourse:", error);
            throw error; // Ném lỗi để Service ở trên bắt được
        }
    },
};

module.exports = courseManagementRepository;
