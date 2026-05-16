const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { protect } = require("../../middlewares/auth.middleware");

router.post("/create-payment-intent", protect, paymentController.createPaymentIntent);
router.post("/success", protect, paymentController.confirmPayment);

// SSLCommerz Routes
router.post("/ssl-init", protect, paymentController.initSSLPayment);
router.post("/ssl-success", paymentController.sslSuccess);
router.post("/ssl-fail", paymentController.sslFail);
router.post("/ssl-cancel", paymentController.sslCancel);

module.exports = router;
