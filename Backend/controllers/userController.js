const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { generateOTP } = require('../services/otpService');
const { sendOTPEmail } = require('../services/emailService');
const { invalidateUserCache } = require('../middleware/responseCache');
const { uploadToCloudinary } = require('../services/cloudinaryService');

// ─── Get Profile ──────────────────────────────────────────────
// GET /api/user/profile
exports.getProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('User not found', 404);

    res.status(200).json({
        success: true,
        data: user,
    });
});

// ─── Update Profile ───────────────────────────────────────────
// PUT /api/user/profile  (accepts multipart/form-data with optional avatar)
exports.updateProfile = asyncHandler(async (req, res, next) => {
    const { name, bio } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    // If an avatar file was uploaded, upload to Cloudinary
    if (req.file) {
        const { url } = await uploadToCloudinary(req.file.buffer, 'notesapp/avatars');
        updateData.profilePic = url; // Store the Cloudinary CDN URL
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!user) throw new AppError('User not found', 404);
    invalidateUserCache(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});

// ─── Send OTP (For Profile Verification) ──────────────────────
// POST /api/user/send-otp
exports.sendOtp = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('User not found', 404);

    if (user.isVerified) {
        return res.status(200).json({ success: true, message: 'User is already verified' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save({ validateBeforeSave: false });

    // Send asynchronously so we don't block
    sendOTPEmail(user.email, otp).catch(err => console.error("Email error:", err));

    res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your email',
    });
});

// ─── Verify OTP (For Profile Verification) ────────────────────
// POST /api/user/verify-otp
exports.verifyOtp = asyncHandler(async (req, res, next) => {
    const { otp } = req.body;
    
    if (!otp) throw new AppError('Please provide an OTP', 400);

    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('User not found', 404);

    if (user.isVerified) {
        return res.status(200).json({ success: true, message: 'User is already verified' });
    }

    if (user.otp !== otp) throw new AppError('Invalid OTP', 400);
    if (user.otpExpiry < Date.now()) throw new AppError('OTP has expired. Please request a new one.', 400);

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: user,
    });
});
