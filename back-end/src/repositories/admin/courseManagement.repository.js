const Course = require('../../models/Course');
const Review = require('../../models/Review');
const Module = require('../../models/Module');
const Lesson = require('../../models/Lesson');
const Material = require('../../models/Material');
const Quiz = require('../../models/Quiz');
const Enrollment = require('../../models/Enrollment');

const courseManagementRepository = {
  getAllCourses: async () => {
    const reviews = await Review.find();
    const averageRatings = {};

    reviews.forEach(review => {
      if (!averageRatings[review.course]) {
        averageRatings[review.course] = {
          totalRating: 0,
          numberOfReviews: 0
        };
      }
      averageRatings[review.course].totalRating += review.rating;
      averageRatings[review.course].numberOfReviews++;
    });

    for (const courseId in averageRatings) {
      averageRatings[courseId].averageRating = averageRatings[courseId].totalRating / averageRatings[courseId].numberOfReviews;
    }

    const courses = await Course.find()
      .populate('category')
      .populate('main_instructor')
      .populate('instructors.id')
      .populate('instructors.permission')
      .populate('category')
      .exec();
    return courses.map(course => {
      const courseObj = course.toObject();
      courseObj.averageRating = averageRatings[course._id]?.averageRating || 0;
      return courseObj;
    });
  },

  //get a course details with all populated fields: modules, lessons, materials, quizzes, reviews, enrollments
  getCourseDetailsById: async (courseId) => {
    // Get course with populated basic fields
    const course = await Course.findById(courseId)
      .populate('category')
      .populate('main_instructor')
      .populate('instructors.id')
      .populate('instructors.permission')
      .exec();

    if (!course) {
      return null;
    }

    // Get modules for this course
    const modules = await Module.find({ courseId })
      .sort({ order: 1 })
      .exec();

    // Get all lessons for these modules
    const moduleIds = modules.map(m => m._id);
    const lessons = await Lesson.find({ moduleId: { $in: moduleIds } })
      .populate('materials')
      .sort({ order: 1 })
      .exec();

    // Get all lesson IDs
    const lessonIds = lessons.map(l => l._id);

    // Get quizzes for these lessons
    const lessonQuizzes = await Quiz.find({ lessonId: { $in: lessonIds } })
      .populate('createdBy', 'name email')
      .exec();

    // Create a map for quick quiz lookup by lessonId
    const quizByLessonMap = {};
    lessonQuizzes.forEach(quiz => {
      if (quiz.lessonId) {
        quizByLessonMap[quiz.lessonId.toString()] = quiz;
      }
    });

    // Get reviews with user info
    const reviews = await Review.find({ courseId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();

    // Calculate average rating and total reviews
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    // Get enrollment count
    const totalEnrollments = await Enrollment.countDocuments({ courseId });

    // Get quizzes at course level
    const courseQuizzes = await Quiz.find({ courseId })
      .populate('createdBy', 'name email')
      .exec();

    // Get quizzes at module level
    const moduleQuizzes = await Quiz.find({ moduleId: { $in: moduleIds } })
      .populate('createdBy', 'name email')
      .exec();

    // Create a map for module quizzes
    const quizByModuleMap = {};
    moduleQuizzes.forEach(quiz => {
      if (quiz.moduleId) {
        const modId = quiz.moduleId.toString();
        if (!quizByModuleMap[modId]) {
          quizByModuleMap[modId] = [];
        }
        quizByModuleMap[modId].push(quiz);
      }
    });

    // Organize lessons by module and attach quiz data
    const modulesWithLessons = modules.map(module => {
      const moduleLessons = lessons
        .filter(lesson => lesson.moduleId.toString() === module._id.toString())
        .map(lesson => {
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
      totalEnrollments
    };

    return courseDetails;
  },

  // Approve course and publish all related quizzes
  approveCourse: async (courseId) => {
    try {
      console.log(` Approving course ${courseId}...`);

      // 1. Update course status to 'approve' and set isPublished to true
      const course = await Course.findByIdAndUpdate(
        courseId,
        {
          status: 'approve',
          isPublished: true,
          reasonReject: '' // Clear rejection reason if any
        },
        { new: true }
      ).exec();

      if (!course) {
        throw new Error('Course not found');
      }

      // 2. Get all modules of this course
      const modules = await Module.find({ courseId }).exec();
      const moduleIds = modules.map(m => m._id);

      // 3. Get all lessons of these modules
      const lessons = await Lesson.find({
        moduleId: { $in: moduleIds }
      }).exec();
      const lessonIds = lessons.map(l => l._id);

      // 4. Publish all quizzes at course level
      const courseQuizzesUpdate = await Quiz.updateMany(
        { courseId, isPublished: false },
        { isPublished: true }
      ).exec();

      // 5. Publish all quizzes at module level
      const moduleQuizzesUpdate = await Quiz.updateMany(
        { moduleId: { $in: moduleIds }, isPublished: false },
        { isPublished: true }
      ).exec();

      // 6. Publish all quizzes at lesson level
      const lessonQuizzesUpdate = await Quiz.updateMany(
        { lessonId: { $in: lessonIds }, isPublished: false },
        { isPublished: true }
      ).exec();

      console.log(`Course approved successfully!`);
      console.log(`   - Course quizzes published: ${courseQuizzesUpdate.modifiedCount}`);
      console.log(`   - Module quizzes published: ${moduleQuizzesUpdate.modifiedCount}`);
      console.log(`   - Lesson quizzes published: ${lessonQuizzesUpdate.modifiedCount}`);

      return {
        course,
        quizzesPublished: {
          courseLevel: courseQuizzesUpdate.modifiedCount,
          moduleLevel: moduleQuizzesUpdate.modifiedCount,
          lessonLevel: lessonQuizzesUpdate.modifiedCount,
          total: courseQuizzesUpdate.modifiedCount +
            moduleQuizzesUpdate.modifiedCount +
            lessonQuizzesUpdate.modifiedCount
        }
      };
    } catch (error) {
      console.error('Repository Error - approveCourse:', error);
      throw error;
    }
  },

  // Reject course
  rejectCourse: async (courseId, reasonReject) => {
    try {
      console.log(`❌ Rejecting course ${courseId}...`);

      const course = await Course.findByIdAndUpdate(
        courseId,
        {
          status: 'reject',
          isPublished: false,
          reasonReject: reasonReject || 'Course does not meet requirements'
        },
        { new: true }
      ).exec();

      if (!course) {
        throw new Error('Course not found');
      }

      // Optional: Unpublish all quizzes when rejected
      const modules = await Module.find({ courseId }).exec();
      const moduleIds = modules.map(m => m._id);
      const lessons = await Lesson.find({
        moduleId: { $in: moduleIds }
      }).exec();
      const lessonIds = lessons.map(l => l._id);

      await Quiz.updateMany(
        {
          $or: [
            { courseId },
            { moduleId: { $in: moduleIds } },
            { lessonId: { $in: lessonIds } }
          ]
        },
        { isPublished: false }
      ).exec();

      console.log(`Course rejected successfully!`);

      return course;
    } catch (error) {
      console.error('Repository Error - rejectCourse:', error);
      throw error;
    }
  }
}

module.exports = courseManagementRepository;