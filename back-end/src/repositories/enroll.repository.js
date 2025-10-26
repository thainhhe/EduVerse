const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

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
};

module.exports = enrollmentRepository;