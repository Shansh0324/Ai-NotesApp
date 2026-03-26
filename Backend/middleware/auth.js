const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const User = require('../models/User');

/**
 * Protect routes — verify JWT and attach user to req.
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Extract token from Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new AppError('Not authorized — no token provided', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id);
    if (!user) {
        throw new AppError('User belonging to this token no longer exists', 401);
    }

    req.user = user;
    next();
});

module.exports = { protect };
