const Course = require('../../models/Course');
const Review = require('../../models/Review');

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
}

module.exports = courseManagementRepository;