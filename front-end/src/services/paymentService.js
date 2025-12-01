import api from "./api";

export const paymentService = {
    createPayment: async (data) => await api.post("/payment/create", data),
    createPaymentIntent: async (data) => await api.post("/payment/create-payment-intent", data),
    getAllPaymentAdmin: async () => await api.get("/payment/admin"),
    getAllPaymentUser: async (userId) => await api.get(`/payment/user/${userId}`),
    getPaymentById: async (id) => await api.get(`/payment/${id}`),
};
