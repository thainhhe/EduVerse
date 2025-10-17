const Enrollment = require("../models/Enrollment");

// Enroll a user in a course
const enrollUser = async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        const existingEnrollment = await Enrollment.findOne({ userId, courseId });
        if (existingEnrollment) {
            return res.status(400).json({ message: "User is already enrolled in this course." });
        }
        const newEnrollment = new Enrollment({ userId, courseId });
        const savedEnrollment = await newEnrollment.save();
        res.status(201).json(savedEnrollment);
    } catch (error) {
        res.status(500).json({ message: "Error enrolling user", error });
    }
};

// Get all enrollments for a specific user
const getEnrollmentsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const enrollments = await Enrollment.find({ userId }).populate('courseId', 'title description');
        res.status(200).json(enrollments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching enrollments", error });
    }
};

// Update enrollment progress
const updateEnrollmentProgress = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { progress, status, grade } = req.body;
        const updatedEnrollment = await Enrollment.findByIdAndUpdate(
            enrollmentId,
            { progress, status, grade, lastAccessed: Date.now() },
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

// Unenroll a user from a course
const unenrollUser = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const deletedEnrollment = await Enrollment.findByIdAndDelete(enrollmentId);
        if (!deletedEnrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }
        res.status(200).json({ message: "User unenrolled successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error unenrolling user", error });
    }
};

module.exports = {
    enrollUser,
    getEnrollmentsByUser,
    updateEnrollmentProgress,
    unenrollUser,
};