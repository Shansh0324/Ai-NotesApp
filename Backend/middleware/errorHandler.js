const AppError = require('../utils/AppError');

/**
 * Centralized error-handling middleware.
 * Transforms Mongoose / JWT errors into user-friendly responses.
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err, message: err.message };

    // Log for dev
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', err);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = new AppError(`Resource not found with id: ${err.value}`, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(', ');
        error = new AppError(`Duplicate field value for: ${field}`, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        error = new AppError(messages.join('. '), 400);
    }

    // JWT invalid token
    if (err.name === 'JsonWebTokenError') {
        error = new AppError('Invalid token — authorization denied', 401);
    }

    // JWT expired token
    if (err.name === 'TokenExpiredError') {
        error = new AppError('Token expired — please log in again', 401);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal Server Error',
    });
};

module.exports = errorHandler;
