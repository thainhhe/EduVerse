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
        averageRatings[courseId].totalRating /
        averageRatings[courseId].numberOfReviews;
    }

    const courses = await Course.find()
      .populate("category")
      .populate("main_instructor")
      .populate("instructors.id")
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
    // Get course with populated basic fields
    const course = await Course.findById(courseId)
      .populate("category")
      .populate("main_instructor")
      .populate("instructors.id")
      .populate("instructors.permission")
      .exec();

    if (!course) {
      return null;
    }

    // Get modules for this course
    const modules = await Module.find({ courseId }).sort({ order: 1 }).exec();

    // Get all lessons for these modules
    const moduleIds = modules.map((m) => m._id);
    const lessons = await Lesson.find({ moduleId: { $in: moduleIds } })
      .populate("materials")
      .sort({ order: 1 })
      .exec();

    // Get all lesson IDs
    const lessonIds = lessons.map((l) => l._id);

    // Get quizzes for these lessons
    const lessonQuizzes = await Quiz.find({ lessonId: { $in: lessonIds } })
      .populate("createdBy", "name email")
      .exec();

    // Create a map for quick quiz lookup by lessonId
    const quizByLessonMap = {};
    lessonQuizzes.forEach((quiz) => {
      if (quiz.lessonId) {
        quizByLessonMap[quiz.lessonId.toString()] = quiz;
      }
    });

    // Get reviews with user info
    const reviews = await Review.find({ courseId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .exec();

    // Calculate average rating and total reviews
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    // Get enrollment count
    const totalEnrollments = await Enrollment.countDocuments({ courseId });

    // Get quizzes at course level
    const courseQuizzes = await Quiz.find({ courseId })
      .populate("createdBy", "name email")
      .exec();

    // Get quizzes at module level
    const moduleQuizzes = await Quiz.find({ moduleId: { $in: moduleIds } })
      .populate("createdBy", "name email")
      .exec();

    // Create a map for module quizzes
    const quizByModuleMap = {};
    moduleQuizzes.forEach((quiz) => {
      if (quiz.moduleId) {
        const modId = quiz.moduleId.toString();
        if (!quizByModuleMap[modId]) {
          quizByModuleMap[modId] = [];
        }
        quizByModuleMap[modId].push(quiz);
      }
    });

    // Organize lessons by module and attach quiz data
    const modulesWithLessons = modules.map((module) => {
      const moduleLessons = lessons
        .filter(
          (lesson) => lesson.moduleId.toString() === module._id.toString()
        )
        .map((lesson) => {
          const lessonObj = lesson.toObject();
          // Attach quiz if exists for this lesson
          const lessonQuiz = quizByLessonMap[lesson._id.toString()];
          if (lessonQuiz) {
            lessonObj.quiz = lessonQuiz;
          }
          return lessonObj;
        });

      const moduleObj = module.toObject();
      moduleObj.lessons = moduleLessons;

      // Attach quizzes at module level
      const modQuizzes = quizByModuleMap[module._id.toString()] || [];
      if (modQuizzes.length > 0) {
        moduleObj.quizzes = modQuizzes;
      }

      return moduleObj;
    });

    // Build complete course object
    const courseDetails = {
      ...course.toObject(),
      modules: modulesWithLessons,
      reviews: reviews,
      quizzes: courseQuizzes, // quizzes at course level
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalReviews,
      totalEnrollments,
    };

    return courseDetails;
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
        Quiz.updateMany(
          { moduleId: { $in: moduleIds } },
          { isPublished: true }
        ),
        Quiz.updateMany(
          { lessonId: { $in: lessonIds } },
          { isPublished: true }
        ),
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
        console.log(
          `🗨️ Forum created for course ${course._id}: ${newForum._id}`
        );
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
          total:
            courseQuiz.modifiedCount +
            moduleQuiz.modifiedCount +
            lessonQuiz.modifiedCount,
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
          $or: [
            { courseId },
            { moduleId: { $in: moduleIds } },
            { lessonId: { $in: lessonIds } },
          ],
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
