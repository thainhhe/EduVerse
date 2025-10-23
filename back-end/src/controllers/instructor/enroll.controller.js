const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');

// Get all user enrollments of course
const getUserEnrollmentsOfCourse = async (req, res) => {
    try {
        const { courseId} = req.params;
        const user = await Enrollment
            .find({ courseId })
            .populate('userId', 'name' )
            .exec();

        const formattedEnrollments = user.map(enrollment => ({
            id: enrollment._id,
            user: enrollment.userId.name,
            enrollmentDate: enrollment.enrollmentDate,
            progress: enrollment.progress,
            status: enrollment.status,
            lastAccessed: enrollment.lastAccessed,
            grade: enrollment.grade,
        }));
        res.status(200).json(formattedEnrollments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching enrollment for user and course", error });
    }
};

// Delete an enrollment
const deleteEnrollment = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const deletedEnrollment = await Enrollment.findByIdAndDelete(enrollmentId);
        if (!deletedEnrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        await Course.findByIdAndUpdate(deletedEnrollment.courseId, { $inc: { totalEnrollments: -1 } });

        res.status(200).json({ message: "Enrollment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting enrollment", error });
    }
};

module.exports = {
    getUserEnrollmentsOfCourse,
    deleteEnrollment,
};