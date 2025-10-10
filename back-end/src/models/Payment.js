const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        amount: { type: Number, required: true },
        paymentDate: { type: Date, default: Date.now },
        paymentMethod: { type: String, enum: ["credit_card", "paypal", "bank_transfer"], required: true },
        status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    },
    {
        timestamps: true,
        collection: "payments",
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
