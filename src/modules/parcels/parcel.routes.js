const express = require("express");
const router = express.Router();
const parcelController = require("./parcel.controller");
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
router.post('/book', protect, parcelController.createParcel);
router.patch('/:id/assign-rider', protect, authorize('admin'), parcelController.assignRiderToParcel);
router.get('/admin/stats', protect, authorize('admin'), parcelController.getAdminStats);
router.get('/track/:trackingId', parcelController.trackParcel);
router.patch('/:id/status', protect, authorize('admin', 'rider'), parcelController.updateParcelStatus);
router.get('/my-bookings', protect, parcelController.getMyBookings);
router.put('/cancel/:id', protect, parcelController.cancelParcel);

// Rider specialized routes
router.get('/available', protect, authorize('rider'), parcelController.getAvailableParcels);
router.put('/accept/:id', protect, authorize('rider'), parcelController.acceptParcel);
router.get('/my-tasks', protect, authorize('rider'), parcelController.getMyTasks);
router.put('/update-status/:id', protect, authorize('rider'), parcelController.updateDeliveryStatus);
router.get('/rider-stats', protect, authorize('rider'), parcelController.getRiderStats);
module.exports = router;
