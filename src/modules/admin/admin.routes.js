const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { isAdmin } = require("../../middlewares/role.middleware");

// All routes protected: must be logged-in AND have role = "admin"
router.use(protect, isAdmin);

router.get("/dashboard-stats",      adminController.getDashboardStats);
router.get("/riders/pending",       adminController.getPendingRiders);
router.put("/riders/approve/:id",   adminController.approveRider);
router.get("/riders",               adminController.getAllRiders);
router.get("/users",                adminController.getAllUsers);
router.put("/users/:id/role-status", adminController.updateUserRoleStatus);
router.put("/users/:id/status",     adminController.updateUserRoleStatus); // Backward compatibility
router.put("/users/:id/role",       adminController.updateUserRoleStatus); // Backward compatibility
router.get("/parcels",              adminController.getAllParcels);

module.exports = router;
