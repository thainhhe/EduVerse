const mongoose = require("mongoose");

const issueReportSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        issueType: { type: String, enum: ["bug", "feature", "other"], required: true },
        description: { type: String, required: true },
        status: { type: String, enum: ["open", "inprogress", "resolved"], default: "open" },
        fileAttachment: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "issue_reports",
    }
);

module.exports = mongoose.model("IssueReport", issueReportSchema);
