const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        enrollmentDate: { type: Date, default: Date.now },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        status: { type: String, enum: ["enrolled", "completed", "dropped"], default: "enrolled" },
        lastAccessed: { type: Date, default: Date.now },
        grade: { type: String, enum: ["A", "B", "C", "D", "F", "Incomplete"], default: "Incomplete" },
    },
    {
        timestamps: true,
        collection: "enrollments",
    }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
