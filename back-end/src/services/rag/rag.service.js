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
  // GIỮ NGUYÊN logic lọc { status: "approve" } quan trọng của bạn
  const [
    courses,
    categories,
    modules,
    lessons,
    materials,
    quizzes,
    reviews,
    enrollments,
    users,
  ] = await Promise.all([
    Course.find({ status: "approve" }).lean().exec(), //
    Category.find().lean().exec(),
    Module.find().lean().exec(),
    Lesson.find().lean().exec(),
    Material.find().lean().exec(),
    Quiz.find().lean().exec(),
    Review.find().lean().exec(),
    Enrollment.find().lean().exec(),
    User.find().lean().exec(),
  ]);

  // 2. Tạo Maps để tra cứu (giống hệt sync-data.js)
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));
  const moduleMap = new Map(modules.map((m) => [String(m._id), m]));
  const lessonMap = new Map(lessons.map((l) => [String(l._id), l])); // ...existing code...
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  // NEW: map categories for denormalization
  const categoryMap = new Map(categories.map((cat) => [String(cat._id), cat]));

  // --- NEW: enrich courses with instructor name + ensure duration kept ---
  const processedCourses = courses.map((c) => {
    // Hỗ trợ cả trường hợp c.main_instructor là ObjectId hoặc là object populated { _id, username, email }
    const populatedInstructor =
      c.main_instructor &&
      typeof c.main_instructor === "object" &&
      c.main_instructor._id
        ? c.main_instructor
        : null;

    const instructorId = populatedInstructor?._id
      ? String(populatedInstructor._id)
      : c.main_instructor
      ? String(c.main_instructor)
      : null;

    const userFromMap = instructorId ? userMap.get(instructorId) : null;

    // Lấy tên hiển thị ưu tiên: populated.username -> userFromMap.username -> userFromMap.email -> null
    const instructorName =
      (populatedInstructor &&
        (populatedInstructor.username ||
          populatedInstructor.name ||
          populatedInstructor.email)) ||
      (userFromMap &&
        (userFromMap.username || userFromMap.name || userFromMap.email)) ||
      null;

    // NEW: lấy subject_instructor và job_title từ populated hoặc userMap
    const instructorSubject =
      (populatedInstructor && populatedInstructor.subject_instructor) ||
      (userFromMap && userFromMap.subject_instructor) ||
      null;
    const instructorJobTitle =
      (populatedInstructor && populatedInstructor.job_title) ||
      (userFromMap && userFromMap.job_title) ||
      null;

    // Resolve category (if any)
    const cat =
      c.category && String(c.category)
        ? categoryMap.get(String(c.category))
        : null;
    const categoryName = cat ? cat.name : null;
    const categoryId = cat && cat._id ? String(cat._id) : null;

    return {
      ...c,
      main_instructor_name: instructorName,
      // NEW: expose subject & job_title on course doc for downstream denorm
      main_instructor_subject: instructorSubject,
      main_instructor_job_title: instructorJobTitle,
      duration: c.duration || null,
      category_name: categoryName,
      category_id: categoryId,
    };
  });

  // Replace courseMap so downstream denormalization reads enriched fields
  const enrichedCourseMap = new Map(
    processedCourses.map((c) => [String(c._id), c])
  );

  // 3. Denormalize (làm giàu) dữ liệu

  const processedModules = modules.map((m) => {
    const course = m.courseId
      ? enrichedCourseMap.get(String(m.courseId))
      : null;
    return {
      ...m,
      course_title: course?.title,
      course_price: course?.price,
      course_category_name: course?.category_name || null,
      course_category_id: course?.category_id || null,
      course_main_instructor_name: course?.main_instructor_name,
      // NEW: propagate subject & job_title
      course_main_instructor_subject: course?.main_instructor_subject || null,
      course_main_instructor_job_title:
        course?.main_instructor_job_title || null,
      course_duration: course?.duration,
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
      courseId: l.courseId || resolvedCourseId, // <-- THÊM DÒNG NÀY
      course_category_name: course?.category_name || null,
      course_category_id: course?.category_id || null,
      course_main_instructor_name: course?.main_instructor_name,
      // NEW:
      course_main_instructor_subject: course?.main_instructor_subject || null,
      course_main_instructor_job_title:
        course?.main_instructor_job_title || null,
      course_duration: course?.duration,
    };
  });

  const processedMaterials = materials.map((m) => {
    const course = m.courseId
      ? enrichedCourseMap.get(String(m.courseId))
      : null;
    return {
      ...m,
      course_title: course?.title,
      course_price: course?.price,
      course_category_name: course?.category_name || null,
      course_category_id: course?.category_id || null,
      course_main_instructor_name: course?.main_instructor_name,
      // NEW:
      course_main_instructor_subject: course?.main_instructor_subject || null,
      course_main_instructor_job_title:
        course?.main_instructor_job_title || null,
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
          // NEW:
          doc.course_main_instructor_subject =
            course?.main_instructor_subject || null;
          doc.course_main_instructor_job_title =
            course?.main_instructor_job_title || null;
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
        // NEW:
        doc.course_main_instructor_subject =
          course?.main_instructor_subject || null;
        doc.course_main_instructor_job_title =
          course?.main_instructor_job_title || null;
        doc.course_duration = course?.duration;
      }
    } else if (q.courseId) {
      const course = enrichedCourseMap.get(String(q.courseId));
      doc.course_title = course?.title;
      doc.course_price = course?.price;
      doc.course_category_name = course?.category_name || null;
      doc.course_category_id = course?.category_id || null;
      doc.course_main_instructor_name = course?.main_instructor_name;
      // NEW:
      doc.course_main_instructor_subject =
        course?.main_instructor_subject || null;
      doc.course_main_instructor_job_title =
        course?.main_instructor_job_title || null;
      doc.course_duration = course?.duration;
    }
    return doc;
  });

  const processedReviews = reviews.map((r) => {
    const course = r.courseId
      ? enrichedCourseMap.get(String(r.courseId))
      : null;
    const user = r.userId ? userMap.get(String(r.userId)) : null;
    return {
      ...r,
      course_title: course?.title,
      user_name: user?.name,
      course_price: course?.price,
      course_category_name: course?.category_name || null,
      course_category_id: course?.category_id || null,
      course_main_instructor_name: course?.main_instructor_name,
      // NEW:
      course_main_instructor_subject: course?.main_instructor_subject || null,
      course_main_instructor_job_title:
        course?.main_instructor_job_title || null,
      course_duration: course?.duration,
    };
  });

  const processedEnrollments = enrollments.map((en) => {
    const course = en.courseId
      ? enrichedCourseMap.get(String(en.courseId))
      : null;
    const user = en.userId ? userMap.get(String(en.userId)) : null;
    return {
      ...en,
      course_title: course?.title,
      user_name: user?.name,
      course_price: course?.price,
      course_category_name: course?.category_name || null,
      course_category_id: course?.category_id || null,
      course_main_instructor_name: course?.main_instructor_name,
      // NEW:
      course_main_instructor_subject: course?.main_instructor_subject || null,
      course_main_instructor_job_title:
        course?.main_instructor_job_title || null,
      course_duration: course?.duration,
    };
  });

  // 4. Trả về một đối tượng JSON lớn
  return {
    courses: processedCourses, // enriched courses (approve)
    categories,
    modules: processedModules,
    lessons: processedLessons,
    materials: processedMaterials,
    quizzes: processedQuizzes,
    reviews: processedReviews,
    enrollments: processedEnrollments,
    // Chúng ta không cần gửi 'users'
  };
};

module.exports = {
  getSyncData,
};
