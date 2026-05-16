const express = require('express');
const router = express.Router();
const riderController = require('./rider.controller');

router.post('/apply', riderController.applyToBeRider);
router.get('/applications', riderController.getRiderApplications);
router.patch('/:id/approve', riderController.approveRider);
router.get('/:riderId/tasks', riderController.getRiderTasks);

module.exports = router;