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
};

module.exports = { paymentController };
