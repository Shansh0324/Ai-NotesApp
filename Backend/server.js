const dotenv = require('dotenv');

// Load env vars BEFORE anything else
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

// ─── Connect to Database ──────────────────────────────────────
connectDB();

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// ─── Handle Unhandled Promise Rejections ──────────────────────
process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});

// ─── Handle Uncaught Exceptions ───────────────────────────────
process.on('uncaughtException', (err) => {
    console.error(`❌ Uncaught Exception: ${err.message}`);
    process.exit(1);
});
