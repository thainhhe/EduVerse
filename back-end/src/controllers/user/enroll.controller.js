const Enrollment = require("../../models/Enrollment.js");
const Course = require("../../models/Course.js");

// Enroll a user in a course
const enrollUser = async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        const existingEnrollment = await Enrollment.findOne({ userId, courseId });
        if (existingEnrollment) {
            return res.status(400).json({ message: "User is already enrolled in this course." });
        }
        const newEnrollment = new Enrollment({ userId, courseId });

        const totalEnrollments = await Enrollment.countDocuments({ courseId });
        await Course.findByIdAndUpdate(courseId, { $inc: { totalEnrollments: 1 } });

        const savedEnrollment = await newEnrollment.save();
        res.status(201).json(savedEnrollment);
    } catch (error) {
        res.status(500).json({ message: "Error enrolling user", error });
    }
};

// Get enrollments by user ID
const getEnrollmentByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const enrollments = await Enrollment
            .find({ userId })
            .populate('courseId', 'title')
            .exec();

        const formattedEnrollments = enrollments.map(enrollment => ({
            id: enrollment._id,
            course: enrollment.courseId.title,
            enrollmentDate: enrollment.enrollmentDate,
            progress: enrollment.progress,
            status: enrollment.status,
            lastAccessed: enrollment.lastAccessed,
            grade: enrollment.grade,
        }));
        res.status(200).json(formattedEnrollments);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching enrollments for user", error });
    }
};



module.exports = {
    enrollUser,
    getEnrollmentByUserId,
};