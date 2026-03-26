const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * Helper — create token and send response.
 */
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.generateToken();

    res.status(statusCode).json({
        success: true,
        token,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
};

// ─── Signup ───────────────────────────────────────────────────
// POST /api/auth/signup
exports.signup = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email is already registered', 400);
    }

    // Generate OTP
    const { generateOTP } = require('../services/otpService');
    const { sendOTPEmail } = require('../services/emailService');
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({ 
        name, 
        email, 
        password,
        otp,
        otpExpiry
    });

    // Send OTP email (do not block the response)
    sendOTPEmail(user.email, otp).catch(err => console.error("Email error:", err));

    sendTokenResponse(user, 201, res);
});

// ─── Verify OTP (Auth Flow) ───────────────────────────────────
// POST /api/auth/verify-otp
exports.verifyOTP = asyncHandler(async (req, res, next) => {
    const { otp } = req.body;
    
    if (!otp) {
        throw new AppError('Please provide an OTP', 400);
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
        return res.status(200).json({ success: true, message: 'User is already verified' });
    }

    if (user.otp !== otp) {
        throw new AppError('Invalid OTP', 400);
    }

    if (user.otpExpiry < Date.now()) {
        throw new AppError('OTP has expired. Please request a new one.', 400);
    }

    // OTP matched and hasn't expired
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified
        }
    });
});

// ─── Login ────────────────────────────────────────────────────
// POST /api/auth/login
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
    }

    sendTokenResponse(user, 200, res);
});

// ─── Get Current User ────────────────────────────────────────
// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});
