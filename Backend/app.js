const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const AppError = require('./utils/AppError');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { protect } = require('./middleware/auth');

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// ─── Security Headers ─────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// ─── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// ─── Global Rate Limiter ──────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ─── Body Parser ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '📝 Notes API is running',
    });
});

// ─── Mount Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);

// ─── Static Uploads (with optional token auth for browsers) ───
// Browsers can't send Authorization headers for <img src>, so we
// accept the JWT via a ?token= query param as a fallback.
// This keeps uploaded files (avatars, PDFs) accessible only to
// logged-in users.
app.use('/uploads', (req, res, next) => {
    // Try Authorization header first, then fall back to query param
    if (!req.headers.authorization && req.query.token) {
        req.headers.authorization = `Bearer ${req.query.token}`;
    }
    next();
}, protect, (req, res, next) => {
    res.setHeader('Cache-Control', 'private, max-age=3600');
    next();
}, express.static(path.join(__dirname, 'uploads')));

// ─── 404 Handler ──────────────────────────────────────────────
app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.method} ${req.originalUrl}`, 404));
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
