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
      .populate('quiz')
      .sort({ order: 1 })
      .exec();

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

    // Organize lessons by module
    const modulesWithLessons = modules.map(module => {
      const moduleLessons = lessons.filter(
        lesson => lesson.moduleId.toString() === module._id.toString()
      );
      return {
        ...module.toObject(),
        lessons: moduleLessons
      };
    });

    // Build complete course object
    const courseDetails = {
      ...course.toObject(),
      modules: modulesWithLessons,
      reviews: reviews,
      quizzes: courseQuizzes,
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalReviews,
      totalEnrollments
    };

    return courseDetails;
  }
}

module.exports = courseManagementRepository;