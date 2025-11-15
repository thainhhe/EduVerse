import api from "./api";

export const paymentService = {
    createPaymentIntent: async (data) => await api.post("/payment/create", data),
};
