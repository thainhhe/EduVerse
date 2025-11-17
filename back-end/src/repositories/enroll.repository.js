const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const Score = require("../models/Score");
const Material = require("../models/Material");
const Quiz = require("../models/Quiz");

const enrollmentRepository = {
  getAllEnrollments: async () => {
    try {
      return await Enrollment.find()
        .populate("userId", "name username email")
        .populate("courseId", "title description")
        .exec();
    } catch (error) {
      console.error("Repository Error - getAllEnrollments:", error);
      throw error;
    }
  },

  getEnrollmentById: async (id) => {
    try {
      return await Enrollment.findById(id)
        .populate("userId", "name username email")
        .populate("courseId", "title description")
        .exec();
    } catch (error) {
      console.error("Repository Error - getEnrollmentById:", error);
      throw error;
    }
  },

  getEnrollmentByUserAndCourse: async (userId, courseId) => {
    try {
      return await Enrollment.findOne({ userId, courseId }).exec();
    } catch (error) {
      console.error("Repository Error - getEnrollmentByUserAndCourse:", error);
      throw error;
    }
  },

  getAllEnrollmentByUser: async (userId) => {
    try {
      return await Enrollment.find({ userId })
        .populate("userId", "name username email")
        .populate("courseId", "title description")
        .exec();
    } catch (error) {
      console.error("Repository Error - getAllEnrollmentByUser:", error);
      throw error;
    }
  },

  createEnrollment: async (data) => {
    try {
      console.log("💾 Repository: Creating enrollment...", data);
      const enrollment = await Enrollment.create(data);
      console.log("✅ Repository: Enrollment created with ID:", enrollment._id);

      // Populate sau khi tạo
      console.log("🔄 Repository: Populating user and course...");
      const populatedEnrollment = await Enrollment.findById(enrollment._id)
        .populate("userId", "name username email")
        .populate("courseId", "title description")
        .exec();
      console.log(
        "✅ Repository: Populated successfully:",
        populatedEnrollment
      );

      return populatedEnrollment;
    } catch (error) {
      console.error("❌ Repository Error - createEnrollment:", error);
      throw error;
    }
  },

  updateEnrollment: async (id, data) => {
    try {
      return await Enrollment.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
        .populate("userId", "name username email")
        .populate("courseId", "title description")
        .exec();
    } catch (error) {
      console.error("Repository Error - updateEnrollment:", error);
      throw error;
    }
  },

  deleteEnrollment: async (id) => {
    try {
      return await Enrollment.findByIdAndDelete(id)
        .populate("userId", "name username email")
        .populate("courseId", "title description")
        .exec();
    } catch (error) {
      console.error("Repository Error - deleteEnrollment:", error);
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
      const modules = await Module.find({
        courseId: { $in: courseIds },
      }).lean();
      const moduleIds = modules.map((m) => m._id?.toString()).filter(Boolean);

      if (!moduleIds.length) {
        console.log("No modules found for courses:", courseIds);
      }

      // 4️⃣ Lấy lessons
      const lessons = await Lesson.find({ moduleId: { $in: moduleIds } })
        .lean();

      // 5️⃣ Lấy tất cả lessonIds
      const lessonIds = lessons.map((l) => l._id?.toString()).filter(Boolean);

      // 5.5 Lấy materials dựa trên lessonIds
      const materials = await Material.find({
        lessonId: { $in: lessonIds },
      })
        .populate({ path: "uploadedBy", select: "name email role" })
        .lean();

      const materialsByLesson = {};
      materials.forEach((mat) => {
        const lid = mat.lessonId?.toString();
        if (lid) {
          if (!materialsByLesson[lid]) materialsByLesson[lid] = [];
          materialsByLesson[lid].push(mat);
        }
      });

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

      // Gom tất cả quiz IDs
      const allQuizIds = [
        ...lessonQuizzes.map((q) => q._id.toString()),
        ...moduleQuizzes.map((q) => q._id.toString()),
        ...courseQuizzes.map((q) => q._id.toString()),
      ].filter(Boolean);

      // 6️⃣ Lấy điểm số (score) của user
      const scores = await Score.find({
        userId,
        quizId: { $in: allQuizIds },
      })
        .populate("quizId", "title passingScore")
        .lean();

      const scoresByQuiz = {};
      scores.forEach((s) => {
        if (s.quizId?._id) {
          const key = `${s.quizId._id.toString()}_${s.attemptNumber || 1}`;
          scoresByQuiz[key] = s;
        }
      });

      // 7️⃣ Gắn quiz và scores vào lesson
      const quizByLesson = {};
      lessonQuizzes.forEach((q) => {
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
        lesson.materials = materialsByLesson[lessonId] || [];
      });

      // 8️⃣ Gắn quiz vào module
      const quizByModule = {};
      moduleQuizzes.forEach((q) => {
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
          const quizId = q._id.toString();
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
        const allModuleQuizzes = courseModules.flatMap(
          (m) => m.moduleQuizzes || []
        );
        const courseQuizList =
          courseQuizzesByCourse[course?._id?.toString()] || [];

        const allLessonScores = allLessonQuizzes.flatMap(
          (q) => q.quizScores || []
        );
        const allModuleScores = allModuleQuizzes.flatMap(
          (q) => q.quizScores || []
        );
        const courseQuizScores = courseQuizList.flatMap(
          (q) => q.quizScores || []
        );

        const totalQuizzes =
          allLessonQuizzes.length +
          allModuleQuizzes.length +
          courseQuizList.length;
        const completedQuizzes =
          allLessonScores.filter((s) => s.status === "passed").length +
          allModuleScores.filter((s) => s.status === "passed").length +
          courseQuizScores.filter((s) => s.status === "passed").length;

        const allScores = [
          ...allLessonScores,
          ...allModuleScores,
          ...courseQuizScores,
        ];
        const uniqueScores = [
          ...new Set(allScores.map((s) => JSON.stringify(s))),
        ].map((s) => JSON.parse(s));
        const averageScore =
          uniqueScores.length > 0
            ? Math.round(
              uniqueScores.reduce((acc, s) => acc + (s.percentage || 0), 0) /
              uniqueScores.length
            )
            : 0;

        course.modules = courseModules;
        course.courseQuizzes = courseQuizList;

        return {
          _id: en._id,
          userId: en.userId,
          enrollmentDate: en.enrollmentDate,
          progress: en.progress || 0,
          status: en.status || "enrolled",
          grade: en.grade || "Incomplete",
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


  getDetailedEnrollmentByUserIdCourseId: async (userId, courseId) => {
    try {
      // 1️⃣ Tìm enrollment duy nhất
      const enrollment = await Enrollment.findOne({ userId, courseId })
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

      if (!enrollment) {
        console.log(
          `❌ Không tìm thấy enrollment cho userId: ${userId}, courseId: ${courseId}`
        );
        return null;
      }

      const course = enrollment.courseId;
      if (!course || !course._id) {
        console.log("❌ Enrollment không có courseId hợp lệ");
        return enrollment;
      }

      const courseIdStr = course._id.toString();

      // 2️⃣ Lấy modules thuộc course
      const modules = await Module.find({ courseId: courseIdStr }).lean();
      const moduleIds = modules.map((m) => m._id?.toString()).filter(Boolean);

      // 3️⃣ Lấy lessons trong các module
      const lessons = await Lesson.find({ moduleId: { $in: moduleIds } })
        .lean();

      // 4️⃣ Lấy quizzes ở cả 3 cấp
      const lessonIds = lessons.map((l) => l._id?.toString()).filter(Boolean);

      // 4.5 Lấy materials cho các lessons
      const materials = await Material.find({
        lessonId: { $in: lessonIds },
      })
        .populate({ path: "uploadedBy", select: "name email role" })
        .lean();

      const materialsByLesson = {};
      materials.forEach((mat) => {
        const lid = mat.lessonId?.toString();
        if (lid) {
          if (!materialsByLesson[lid]) materialsByLesson[lid] = [];
          materialsByLesson[lid].push(mat);
        }
      });

      const lessonQuizzes = await Quiz.find({ lessonId: { $in: lessonIds } })
        .select("title passingScore questions lessonId")
        .lean();

      const moduleQuizzes = await Quiz.find({
        moduleId: { $in: moduleIds },
        lessonId: null,
      })
        .select("title passingScore questions moduleId")
        .lean();

      const courseQuizzes = await Quiz.find({
        courseId: courseIdStr,
        moduleId: null,
        lessonId: null,
      })
        .select("title passingScore questions courseId")
        .lean();

      // 5️⃣ Gom tất cả quizIds
      const allQuizIds = [
        ...lessonQuizzes.map((q) => q._id?.toString()),
        ...moduleQuizzes.map((q) => q._id?.toString()),
        ...courseQuizzes.map((q) => q._id?.toString()),
      ].filter(Boolean);

      // 6️⃣ Lấy điểm của user cho các quiz này
      const scores = await Score.find({
        userId,
        quizId: { $in: allQuizIds },
      })
        .populate("quizId", "title passingScore")
        .lean();

      const scoresByQuiz = {};
      scores.forEach((s) => {
        if (s.quizId?._id) {
          const key = `${s.quizId._id.toString()}_${s.attemptNumber || 1}`;
          scoresByQuiz[key] = s;
        }
      });

      // 7️⃣ Gắn quizScores vào lessons
      const quizByLesson = {};
      lessonQuizzes.forEach((q) => {
        const lid = q.lessonId?.toString();
        if (lid) {
          if (!quizByLesson[lid]) quizByLesson[lid] = [];
          const qid = q._id.toString();
          quizByLesson[lid].push({
            ...q,
            quizScores: Object.values(scoresByQuiz).filter(
              (s) => s.quizId?._id?.toString() === qid
            ),
          });
        }
      });

      lessons.forEach((lesson) => {
        const lid = lesson._id?.toString();
        lesson.quizzes = quizByLesson[lid] || [];
        lesson.materials = materialsByLesson[lid] || [];
      });

      // 8️⃣ Gắn quizScores vào modules
      const quizByModule = {};
      moduleQuizzes.forEach((q) => {
        const mid = q.moduleId?.toString();
        if (mid) {
          if (!quizByModule[mid]) quizByModule[mid] = [];
          const qid = q._id.toString();
          quizByModule[mid].push({
            ...q,
            quizScores: Object.values(scoresByQuiz).filter(
              (s) => s.quizId?._id?.toString() === qid
            ),
          });
        }
      });

      // 9️⃣ Gom lessons theo module
      const lessonsByModule = {};
      lessons.forEach((l) => {
        const mid = l.moduleId?.toString();
        if (mid) {
          if (!lessonsByModule[mid]) lessonsByModule[mid] = [];
          lessonsByModule[mid].push(l);
        }
      });

      // 🔟 Gắn lessons + moduleQuizzes vào modules
      modules.forEach((m) => {
        const mid = m._id?.toString();
        m.lessons = lessonsByModule[mid] || [];
        m.moduleQuizzes = quizByModule[mid] || [];
      });

      // 11️⃣ Gắn quiz cấp course + scores
      const courseQuizWithScores = courseQuizzes.map((q) => {
        const qid = q._id?.toString();
        return {
          ...q,
          quizScores: Object.values(scoresByQuiz).filter(
            (s) => s.quizId?._id?.toString() === qid
          ),
        };
      });
      course.courseQuizzes = courseQuizWithScores;
      course.modules = modules;

      // 12️⃣ Tính toán thống kê (không tính progress)
      const allLessons = modules.flatMap((m) => m.lessons || []);
      const allLessonQuizzes = allLessons.flatMap((l) => l.quizzes || []);
      const allModuleQuizzes = modules.flatMap((m) => m.moduleQuizzes || []);
      const allLessonScores = allLessonQuizzes.flatMap(
        (q) => q.quizScores || []
      );
      const allModuleScores = allModuleQuizzes.flatMap(
        (q) => q.quizScores || []
      );
      const allCourseQuizScores = courseQuizWithScores.flatMap(
        (q) => q.quizScores || []
      );

      const totalQuizzes =
        allLessonQuizzes.length +
        allModuleQuizzes.length +
        courseQuizWithScores.length;
      const completedQuizzes =
        allLessonScores.filter((s) => s.status === "passed").length +
        allModuleScores.filter((s) => s.status === "passed").length +
        allCourseQuizScores.filter((s) => s.status === "passed").length;

      const allScores = [
        ...new Set(
          [...allLessonScores, ...allModuleScores, ...allCourseQuizScores].map(
            (s) => JSON.stringify(s)
          )
        ),
      ].map((s) => JSON.parse(s));

      const averageScore =
        allScores.length > 0
          ? Math.round(
            allScores.reduce((acc, s) => acc + (s.percentage || 0), 0) /
            allScores.length
          )
          : 0;


      return {
        _id: enrollment._id,
        userId: enrollment.userId,
        enrollmentDate: enrollment.enrollmentDate,
        progress: enrollment.progress || 0,
        status: enrollment.status || "enrolled",
        grade: enrollment.grade || "Incomplete",
        totalQuizzes,
        completedQuizzes,
        averageScore,
        allScores,
        courseId: course,
      };
    } catch (error) {
      console.error(
        "❌ Repository Error - getDetailedEnrollmentByUserIdCourseId:",
        {
          message: error.message,
          stack: error.stack,
          userId,
          courseId,
        }
      );
      throw error;
    }
  },

  getProgress: async (userId, courseId) => {
    return await Enrollment.findOne({ userId, courseId })
      .select('progress status lastAccessed')
      .exec();
  }
};

module.exports = enrollmentRepository;
