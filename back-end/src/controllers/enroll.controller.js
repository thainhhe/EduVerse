const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

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

// Update status of an enrollment
const updateEnrollmentStatus = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { status } = req.body;
        const updatedEnrollment = await Enrollment.findByIdAndUpdate(
            enrollmentId,
            { status, lastAccessed: Date.now() },
            { new: true }
        );
        if (!updatedEnrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }
        res.status(200).json(updatedEnrollment);
    } catch (error) {
        res.status(500).json({ message: "Error updating enrollment", error });
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



module.exports = {
    enrollUser,
    getAllEnrollments,
    getEnrollmentById,
    updateEnrollmentStatus,
    deleteEnrollment,
    getEnrollmentByUserId,
    getUserEnrollmentsOfCourse,
};