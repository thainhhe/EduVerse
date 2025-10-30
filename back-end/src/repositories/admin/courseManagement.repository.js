const Course = require('../../models/Course');


const courseManagementRepository = {
  getAllCourses: async () => {
    return await Course.find()
      .populate('category')
      .populate('main_instructor')
      .populate('instructors.id')
      .populate('instructors.permission')
      .populate('category')
      .exec();
  },


}