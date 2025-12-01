const { system_enum } = require("../../config/enum/system.constant");
const axios = require("axios");
const { paymentHelper } = require("./payment.helper");
const { paymentRepository } = require("../../repositories/payment.repository");

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

const paymentService = {
    createPayment: async (data) => {
        try {
            if (!data.courseId || !data.userId) {
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: system_enum.SYSTEM_MESSAGE.INVALID_INPUT,
                };
            }

            const orderCode = paymentHelper.randomNumber();
            const amount = data.total_amount;
            const description = data.description || `Thanh toan hoa don`;
            const returnUrl = `${FRONTEND_URL}/checkout/success`;
            const cancelUrl = `${FRONTEND_URL}/checkout/fail`;

            const paymentData = {
                orderCode: orderCode,
                amount: amount,
                description: description,
                cancelUrl: cancelUrl,
                returnUrl: returnUrl,
            };

            const data_url = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
            const response = await axios.post(
                "https://api-merchant.payos.vn/v2/payment-requests",
                {
                    ...paymentData,
                    signature: paymentHelper.generateSignature(data_url, PAYOS_CHECKSUM_KEY),
                },
                {
                    headers: {
                        "x-client-id": PAYOS_CLIENT_ID,
                        "x-api-key": PAYOS_API_KEY,
                    },
                }
            );

            const payosResponseData = response.data?.data || response.data;

            return {
                status: system_enum.STATUS_CODE.OK,
                message: "Thanh toan thanh cong",
                data: payosResponseData,
            };
        } catch (err) {
            console.error("Error creating PayOS payment:", err.response ? err.response.data : err.message);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                message: err.toString(),
            };
        }
    },

    createPaymentIntent: async (data) => {
        try {
            if (!data.courseId || !data.userId) {
                return {
                    status: system_enum.STATUS_CODE.CONFLICT,
                    message: system_enum.SYSTEM_MESSAGE.INVALID_INPUT,
                };
            }

            const paymentData = {
                orderId: data.orderId,
                orderCode: data.orderCode,
                courseId: data.courseId,
                userId: data.userId,
                amount: data.amount,
                paymentDate: Date.now(),
                paymentMethod: "bank_transfer",
                status: data.status,
            };

            await paymentRepository.create(paymentData);

            return {
                status: system_enum.STATUS_CODE.OK,
                message: "Da luu thanh toan",
                data: paymentData,
            };
        } catch (err) {
            console.error("Error creating PayOS payment:", err.response ? err.response.data : err.message);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                message: err.toString(),
            };
        }
    },

    getAllPaymentAdmin: async () => {
        try {
            const payments = await paymentRepository.getAllPaymentAdmin();
            return {
                status: system_enum.STATUS_CODE.OK,
                message: "Lay thanh cong",
                data: payments,
            };
        } catch (err) {
            console.error("Error getting payments:", err.response ? err.response.data : err.message);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                message: err.toString(),
            };
        }
    },

    getAllPaymentUser: async (userId) => {
        try {
            const payments = await paymentRepository.getAllByUserId(userId);
            return {
                status: system_enum.STATUS_CODE.OK,
                message: "Lay thanh cong",
                data: payments,
            };
        } catch (err) {
            console.error("Error getting payments:", err.response ? err.response.data : err.message);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                message: err.toString(),
            };
        }
    },

    getPaymentById: async (id) => {
        try {
            const payment = await paymentRepository.getById(id);
            if (!payment) {
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: "Payment not found",
                };
            }
            return {
                status: system_enum.STATUS_CODE.OK,
                message: "Lay thanh cong",
                data: payment,
            };
        } catch (err) {
            console.error("Error getting payment by id:", err.response ? err.response.data : err.message);
            return {
                status: system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR,
                message: err.toString(),
            };
        }
    },
};

module.exports = { paymentService };
