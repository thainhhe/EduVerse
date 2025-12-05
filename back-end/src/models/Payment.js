const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        orderId: { type: String, unique: true, required: true },
        orderCode: { type: String, unique: true, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        amount: { type: Number, required: true },
        paymentDate: { type: Date, default: Date.now },
        paymentMethod: {
            type: String,
            enum: ["credit_card", "paypal", "bank_transfer", "free"],
            required: true,
        },
        status: { type: String, enum: ["paid", "failed", "cancelled", "free"], default: "paid" },
    },
    {
        timestamps: true,
        collection: "payments",
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
