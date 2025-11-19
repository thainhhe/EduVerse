const mongoose = require("mongoose");

const issueReportSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Phân loại: 'course' (cho Instructor) hoặc 'system' (cho Admin)
        scope: {
            type: String,
            enum: ["course", "system"],
            required: true
        },

        // Bắt buộc nếu scope là 'course'
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            default: null
        },

        // Người nhận: 'null' (nếu là 'system') hoặc ID của main_instructor
        assigneeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        issueType: {
            type: String,
            enum: ["bug", "feature", "other"],
            required: true
        },
        description: { type: String, required: true },
        status: {
            type: String,
            enum: ["open", "inprogress", "resolved"],
            default: "open"
        },
        fileAttachment: [{ type: String }],
    },
    {
        timestamps: true,
        collection: "issue_reports",
    }
);

// Validate logic: Nếu scope là 'course' thì 'courseId' không được rỗng
issueReportSchema.pre('save', function (next) {
    if (this.scope === 'course' && !this.courseId) {
        return next(new Error('courseId là bắt buộc khi scope là "course".'));
    }
    next();
});

module.exports = mongoose.model("IssueReport", issueReportSchema);