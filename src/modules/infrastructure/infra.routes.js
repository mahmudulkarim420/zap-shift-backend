const express = require('express');
const router = express.Router();
const infraController = require('./infra.controller');
const pricingController = require('./pricing.controller');

router.get("/coverage", infraController.getCoverage);
router.get("/pricing-estimate", infraController.calculateEstimate);
router.post("/pricing/calculate", pricingController.calculatePrice);
router.get("/reviews", infraController.getReviews);
router.post("/reviews", infraController.createReview);
router.get("/warehouses", infraController.getAllWarehouses);

module.exports = router;