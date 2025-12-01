const Payment = require("../models/Payment");

const paymentRepository = {
    create: async (data) => {
        return await Payment.create(data);
    },

    getAllPaymentAdmin: async () => {
        return await Payment.find().populate("userId").populate("courseId");
    },

    getAllByUserId: async (userId) => {
        return await Payment.find({ userId: userId }).populate("userId").populate("courseId");
    },

    getById: async (id) => {
        return await Payment.findById(id).populate("userId").populate("courseId");
    },
};

module.exports = { paymentRepository };
