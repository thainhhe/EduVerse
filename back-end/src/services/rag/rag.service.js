// src/services/rag/rag.service.js

// Import tất cả các Model cần thiết
const Course = require("../../models/Course");
const Category = require("../../models/Category");
const Module = require("../../models/Module");
const Lesson = require("../../models/Lesson");
const Material = require("../../models/Material");
const Quiz = require("../../models/Quiz");
const Review = require("../../models/Review");
const Enrollment = require("../../models/Enrollment");
const User = require("../../models/User");

/**
 * Lấy và tổng hợp tất cả dữ liệu cần thiết cho RAG sync.
 * Logic này được chuyển từ chatbot-service/sync-data.js về đây.
 */
const getSyncData = async () => {
    // 1. Fetch tất cả collections song song
    const [courses, categories, modules, lessons, materials, quizzes, reviews, enrollments, users] =
        await Promise.all([
            Course.find({ status: "approve" }).lean().exec(),
            Category.find().lean().exec(),
            Module.find().lean().exec(),
            Lesson.find().lean().exec(),
            Material.find().lean().exec(),
            Quiz.find().lean().exec(),
            Review.find().lean().exec(),
            Enrollment.find().lean().exec(),
            User.find().lean().exec(),
        ]);

    // 2. Tạo Maps để tra cứu
    const courseMap = new Map(courses.map((c) => [String(c._id), c]));
    const moduleMap = new Map(modules.map((m) => [String(m._id), m]));
    const lessonMap = new Map(lessons.map((l) => [String(l._id), l]));
    const userMap = new Map(users.map((u) => [String(u._id), u]));
    const categoryMap = new Map(categories.map((cat) => [String(cat._id), cat]));

    // NEW: Tính toán rating statistics theo courseId
    const ratingStatsByCourse = new Map();
    reviews.forEach((review) => {
        const courseId = String(review.courseId);
        if (!ratingStatsByCourse.has(courseId)) {
            ratingStatsByCourse.set(courseId, {
                totalRatings: 0,
                totalScore: 0,
                averageRating: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            });
        }

        const stats = ratingStatsByCourse.get(courseId);
        stats.totalRatings += 1;
        stats.totalScore += review.rating;
        stats.ratingDistribution[review.rating] = (stats.ratingDistribution[review.rating] || 0) + 1;
        stats.averageRating = (stats.totalScore / stats.totalRatings).toFixed(2);
    });

    // NEW: Tính toán số lượng học viên theo courseId
    const enrollmentStatsByCourse = new Map();
    enrollments.forEach((en) => {
        // Chỉ đếm các enrollment hợp lệ (ví dụ: đã thanh toán/đang học) nếu cần
        // Ở đây ta đếm hết
        const courseId = String(en.courseId);
        const currentCount = enrollmentStatsByCourse.get(courseId) || 0;
        enrollmentStatsByCourse.set(courseId, currentCount + 1);
    });

    // --- Enrich courses with instructor name + rating stats + enrollment stats ---
    const processedCourses = courses.map((c) => {
        const populatedInstructor =
            c.main_instructor && typeof c.main_instructor === "object" && c.main_instructor._id
                ? c.main_instructor
                : null;

        const instructorId = populatedInstructor?._id
            ? String(populatedInstructor._id)
            : c.main_instructor
            ? String(c.main_instructor)
            : null;

        const userFromMap = instructorId ? userMap.get(instructorId) : null;

        const instructorName =
            (populatedInstructor &&
                (populatedInstructor.username || populatedInstructor.name || populatedInstructor.email)) ||
            (userFromMap && (userFromMap.username || userFromMap.name || userFromMap.email)) ||
            null;

        const instructorSubject =
            (populatedInstructor && populatedInstructor.subject_instructor) ||
            (userFromMap && userFromMap.subject_instructor) ||
            null;

        const instructorJobTitle =
            (populatedInstructor && populatedInstructor.job_title) ||
            (userFromMap && userFromMap.job_title) ||
            null;

        const cat = c.category && String(c.category) ? categoryMap.get(String(c.category)) : null;
        const categoryName = cat ? cat.name : null;
        const categoryId = cat && cat._id ? String(cat._id) : null;

        // NEW: Lấy rating stats cho course này
        const courseId = String(c._id);
        const ratingStats = ratingStatsByCourse.get(courseId) || {
            totalRatings: 0,
            totalScore: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };

        // NEW: Lấy số lượng học viên
        const totalEnrolled = enrollmentStatsByCourse.get(courseId) || 0;

        return {
            ...c,
            main_instructor_name: instructorName,
            main_instructor_subject: instructorSubject,
            main_instructor_job_title: instructorJobTitle,
            duration: c.duration || null,
            category_name: categoryName,
            category_id: categoryId,
            // Rating stats
            total_ratings: ratingStats.totalRatings,
            average_rating: parseFloat(ratingStats.averageRating),
            rating_distribution: ratingStats.ratingDistribution,
            // Enrollment stats
            total_enrolled: totalEnrolled,
        };
    });

    // Replace courseMap với enriched version
    const enrichedCourseMap = new Map(processedCourses.map((c) => [String(c._id), c]));

    // 3. Denormalize data
    const processedModules = modules.map((m) => {
        const course = m.courseId ? enrichedCourseMap.get(String(m.courseId)) : null;
        return {
            ...m,
            course_title: course?.title,
            course_price: course?.price,
            course_category_name: course?.category_name || null,
            course_category_id: course?.category_id || null,
            course_main_instructor_name: course?.main_instructor_name,
            course_main_instructor_subject: course?.main_instructor_subject || null,
            course_main_instructor_job_title: course?.main_instructor_job_title || null,
            course_duration: course?.duration,
            // Rating stats
            course_average_rating: course?.average_rating || 0,
            course_total_ratings: course?.total_ratings || 0,
            // Enrollment stats
            course_total_enrolled: course?.total_enrolled || 0,
        };
    });

    const processedLessons = lessons.map((l) => {
        const module = l.moduleId ? moduleMap.get(String(l.moduleId)) : null;
        const course =
            module && module.courseId
                ? enrichedCourseMap.get(String(module.courseId))
                : l.courseId
                ? enrichedCourseMap.get(String(l.courseId))
                : null;

        // GIẢI QUYẾT courseId
        const resolvedCourseId = course ? String(course._id) : undefined;

        return {
            ...l,
            module_title: module?.title,
            course_title: course?.title,
            course_price: course?.price,
            courseId: l.courseId || resolvedCourseId,
            course_category_name: course?.category_name || null,
            course_category_id: course?.category_id || null,
            course_main_instructor_name: course?.main_instructor_name,
            course_main_instructor_subject: course?.main_instructor_subject || null,
            course_main_instructor_job_title: course?.main_instructor_job_title || null,
            course_duration: course?.duration,
        };
    });

    const processedMaterials = materials.map((m) => {
        const course = m.courseId ? enrichedCourseMap.get(String(m.courseId)) : null;
        return {
            ...m,
            course_title: course?.title,
            course_price: course?.price,
            course_category_name: course?.category_name || null,
            course_category_id: course?.category_id || null,
            course_main_instructor_name: course?.main_instructor_name,
            course_main_instructor_subject: course?.main_instructor_subject || null,
            course_main_instructor_job_title: course?.main_instructor_job_title || null,
            course_duration: course?.duration,
        };
    });

    const processedQuizzes = quizzes.map((q) => {
        const doc = { ...q };
        if (q.lessonId) {
            const lesson = lessonMap.get(String(q.lessonId));
            doc.lesson_title = lesson?.title;
            if (lesson && lesson.moduleId) {
                const mod = moduleMap.get(String(lesson.moduleId));
                doc.module_title = mod?.title;
                if (mod && mod.courseId) {
                    const course = enrichedCourseMap.get(String(mod.courseId));
                    doc.course_title = course?.title;
                    doc.course_price = course?.price;
                    doc.course_category_name = course?.category_name || null;
                    doc.course_category_id = course?.category_id || null;
                    doc.course_main_instructor_name = course?.main_instructor_name;
                    doc.course_main_instructor_subject = course?.main_instructor_subject || null;
                    doc.course_main_instructor_job_title = course?.main_instructor_job_title || null;
                    doc.course_duration = course?.duration;
                }
            }
        } else if (q.moduleId) {
            const mod = moduleMap.get(String(q.moduleId));
            doc.module_title = mod?.title;
            if (mod && mod.courseId) {
                const course = enrichedCourseMap.get(String(mod.courseId));
                doc.course_title = course?.title;
                doc.course_price = course?.price;
                doc.course_category_name = course?.category_name || null;
                doc.course_category_id = course?.category_id || null;
                doc.course_main_instructor_name = course?.main_instructor_name;
                doc.course_main_instructor_subject = course?.main_instructor_subject || null;
                doc.course_main_instructor_job_title = course?.main_instructor_job_title || null;
                doc.course_duration = course?.duration;
            }
        } else if (q.courseId) {
            const course = enrichedCourseMap.get(String(q.courseId));
            doc.course_title = course?.title;
            doc.course_price = course?.price;
            doc.course_category_name = course?.category_name || null;
            doc.course_category_id = course?.category_id || null;
            doc.course_main_instructor_name = course?.main_instructor_name;
            doc.course_main_instructor_subject = course?.main_instructor_subject || null;
            doc.course_main_instructor_job_title = course?.main_instructor_job_title || null;
            doc.course_duration = course?.duration;
        }
        return doc;
    });

    const processedReviews = reviews.map((r) => {
        const course = r.courseId ? enrichedCourseMap.get(String(r.courseId)) : null;
        const user = r.userId ? userMap.get(String(r.userId)) : null;
        return {
            ...r,
            course_title: course?.title,
            course_price: course?.price,
            user_name: user?.name || user?.username || user?.email,
            course_category_name: course?.category_name || null,
            course_category_id: course?.category_id || null,
            course_main_instructor_name: course?.main_instructor_name,
            course_main_instructor_subject: course?.main_instructor_subject || null,
            course_main_instructor_job_title: course?.main_instructor_job_title || null,
            course_duration: course?.duration,
            rating: r.rating,
            comment: r.comment || "",
            review_created_at: r.createdAt,
            review_updated_at: r.updatedAt,
        };
    });

    const processedEnrollments = enrollments.map((en) => {
        const course = en.courseId ? enrichedCourseMap.get(String(en.courseId)) : null;
        const user = en.userId ? userMap.get(String(en.userId)) : null;
        return {
            ...en,
            course_title: course?.title,
            user_name: user?.name,
            course_price: course?.price,
            course_category_name: course?.category_name || null,
            course_category_id: course?.category_id || null,
            course_main_instructor_name: course?.main_instructor_name,
            course_main_instructor_subject: course?.main_instructor_subject || null,
            course_main_instructor_job_title: course?.main_instructor_job_title || null,
            course_duration: course?.duration,
        };
    });

    // 4. Trả về
    return {
        courses: processedCourses,
        categories,
        modules: processedModules,
        lessons: processedLessons,
        materials: processedMaterials,
        quizzes: processedQuizzes,
        reviews: processedReviews,
        enrollments: processedEnrollments,
    };
};

module.exports = {
    getSyncData,
};
