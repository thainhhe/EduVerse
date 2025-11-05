const express = require("express");
const { paymentController } = require("../controllers/payment/payment.controller");

const paymentRouter = express.Router();
paymentRouter.post("/create", paymentController.create_payment);

module.exports = paymentRouter;
