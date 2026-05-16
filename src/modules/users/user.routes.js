const express = require('express');
const router = express.Router();
const userController = require("./user.controller");
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
router.get('/', protect, authorize('admin'), userController.getAllUsers);
router.patch('/:id', protect, authorize('admin'), userController.updateUserControl);

module.exports = router;