const express = require('express');
const router = express.Router();

const { signup, login, getMe, verifyOTP } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Rate-limited auth routes
router.post('/signup', authLimiter, validateSignup, signup);
router.post('/login', authLimiter, validateLogin, login);
router.post('/verify-otp', protect, verifyOTP);
router.get('/me', protect, getMe);

module.exports = router;
