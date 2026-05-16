const express = require('express');
const router = express.Router();
const infraController = require('./infra.controller');

router.get("/coverage", infraController.getCoverage);
router.get("/pricing-estimate", infraController.calculateEstimate);
router.get("/reviews", infraController.getReviews);
router.post("/reviews", infraController.createReview);

module.exports = router;