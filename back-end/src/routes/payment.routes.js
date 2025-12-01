const express = require("express");
const { paymentController } = require("../controllers/payment/payment.controller");

const paymentRouter = express.Router();
paymentRouter.post("/create", paymentController.create_payment);
paymentRouter.post("/create-payment-intent", paymentController.create_payment_intent);
paymentRouter.get("/admin", paymentController.getAllPaymentAdmin);
paymentRouter.get("/user/:userId", paymentController.getAllPaymentUser);
paymentRouter.get("/:id", paymentController.getPaymentById);

module.exports = paymentRouter;
