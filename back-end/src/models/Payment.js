const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        orderId: { type: String, required: true, unique: true },
        orderCode: { type: String, required: true, unique: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        amount: { type: Number, required: true },
        paymentDate: { type: Date, default: Date.now },
        paymentMethod: { type: String, enum: ["credit_card", "paypal", "bank_transfer"], required: true },
        status: { type: String, enum: ["paid", "failed", "cancelled"], default: "failed" },
    },
    {
        timestamps: true,
        collection: "payments",
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
