const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, authController.updateProfile);

module.exports = router;