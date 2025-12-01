const { paymentService } = require("../../services/payment/payment.service");
const { error_response, response } = require("../../utils/response.util");

const paymentController = {
    create_payment: async (req, res) => {
        try {
            const data = req.body;
            const result = await paymentService.createPayment(data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    create_payment_intent: async (req, res) => {
        try {
            const data = req.body;
            const result = await paymentService.createPaymentIntent(data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getAllPaymentAdmin: async (req, res) => {
        try {
            const result = await paymentService.getAllPaymentAdmin();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getAllPaymentUser: async (req, res) => {
        try {
            const result = await paymentService.getAllPaymentUser(req.params.userId);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getPaymentById: async (req, res) => {
        try {
            const result = await paymentService.getPaymentById(req.params.id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { paymentController };
