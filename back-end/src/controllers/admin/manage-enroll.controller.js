const Enrollment = require('../../models/enrollment.model');
const Course = require('../../models/course.model');

// Get all enrollments
const getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment
            .find()
            .populate('userId', 'name')
            .populate('courseId', 'title')
            .exec();

        const formattedEnrollments = enrollments.map(enrollment => ({
            id: enrollment._id,
            user: enrollment.userId.name,
            course: enrollment.courseId.title,
            enrollmentDate: enrollment.enrollmentDate,
            progress: enrollment.progress,
            status: enrollment.status,
            lastAccessed: enrollment.lastAccessed,
            grade: enrollment.grade,
        }));
        res.status(200).json(formattedEnrollments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching enrollments", error });
    }
};

// Get enrollments by enrollment ID
const getEnrollmentById = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const enrollment = await Enrollment.findById(enrollmentId)
            .populate('userId', 'name')
            .populate('courseId', 'title')
            .execPopulate();;
        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        const formattedEnrollment = {
            id: enrollment._id,
            user: enrollment.userId.name,
            course: enrollment.courseId.title,
            enrollmentDate: enrollment.enrollmentDate,
            progress: enrollment.progress,
            status: enrollment.status,
            lastAccessed: enrollment.lastAccessed,
            grade: enrollment.grade,
        };

        res.status(200).json(formattedEnrollment);
    } catch (error) {
        res.status(500).json({ message: "Error fetching enrollment", error });
    }
};


module.exports = {
    getAllEnrollments,
    getEnrollmentById,
};