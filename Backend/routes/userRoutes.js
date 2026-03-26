const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, sendOtp, verifyOtp } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/uploadMiddleware');
const { otpLimiter } = require('../middleware/rateLimiter');
const { responseCache } = require('../middleware/responseCache');

router.use(protect);

router.get('/profile', responseCache(30), getProfile);
router.put('/profile', uploadImage.single('avatar'), updateProfile);

router.post('/send-otp', otpLimiter, sendOtp);
router.post('/verify-otp', otpLimiter, verifyOtp);

module.exports = router;
