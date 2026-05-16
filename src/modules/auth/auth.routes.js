const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.post('/sync', authController.syncUser);
router.get('/me', protect, authController.getMe);

module.exports = router;