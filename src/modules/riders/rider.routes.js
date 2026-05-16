const express = require('express');
const router = express.Router();
const riderController = require('./rider.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { isAdmin, isRider, authorize } = require('../../middlewares/role.middleware');

// Public: apply to be a rider (authenticated user)
router.post('/apply', protect, riderController.applyToBeRider);

// Admin-only: view and manage applications
router.get('/applications', protect, isAdmin, riderController.getRiderApplications);
router.patch('/:id/approve', protect, isAdmin, riderController.approveRider);

// Rider-specific: view own tasks
router.get('/:riderId/tasks', protect, isRider, riderController.getRiderTasks);

module.exports = router;