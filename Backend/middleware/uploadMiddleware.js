const multer = require('multer');
const AppError = require('../utils/AppError');

const fs = require('fs');
const path = require('path');

// ─── Disk storage for PDFs ────────────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// ─── Memory storage for images (sent to Cloudinary) ───────────
const memoryStorage = multer.memoryStorage();

// ─── File Filters ─────────────────────────────────────────────
const pdfFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new AppError('Only PDF files are allowed', 400), false);
    }
};

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new AppError('Only image files are allowed', 400), false);
    }
};

// PDF upload → disk (needed for text extraction)
const upload = multer({
    storage: diskStorage,
    fileFilter: pdfFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// Image upload → memory buffer (sent to Cloudinary, not saved to disk)
const uploadImage = multer({
    storage: memoryStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = { upload, uploadImage };
