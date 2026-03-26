const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Runs validation result check and throws AppError if invalid.
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map((e) => e.msg);
        throw new AppError(messages.join('. '), 400);
    }
    next();
};

// ─── Auth Validators ──────────────────────────────────────────

const validateSignup = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ max: 50 })
        .withMessage('Name cannot exceed 50 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    handleValidationErrors,
];

const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors,
];

// ─── Note Validators ──────────────────────────────────────────

const validateNote = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    handleValidationErrors,
];

const validateNoteUpdate = [
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Title cannot be empty')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    body('content')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Content cannot be empty'),
    handleValidationErrors,
];

module.exports = {
    validateSignup,
    validateLogin,
    validateNote,
    validateNoteUpdate,
};
