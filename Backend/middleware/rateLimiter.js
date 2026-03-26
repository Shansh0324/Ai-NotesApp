const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter — prevents abuse across all endpoints.
 * 100 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again after 15 minutes.',
    },
});

/**
 * Strict rate limiter for auth-sensitive routes (login, signup).
 * 10 attempts per 15 minutes per IP.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
});

/**
 * OTP-specific rate limiter.
 * 5 OTP requests per 10 minutes per IP.
 */
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many OTP requests. Please try again after 10 minutes.',
    },
});

module.exports = { apiLimiter, authLimiter, otpLimiter };
