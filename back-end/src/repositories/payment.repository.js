const Payment = require("../models/Payment");

const paymentRepository = {
    create: async (data) => {
        return await Payment.create(data);
    },
    getAllByUserId: async (userId) => {
        return await Payment.find({ userId: userId });
    },
};

module.exports = { paymentRepository };
