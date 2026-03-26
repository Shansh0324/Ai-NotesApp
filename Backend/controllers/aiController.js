const Document = require('../models/Document');
const Note = require('../models/Note');
const { extractTextFromPDF } = require('../services/pdfService');
const { chunkText } = require('../utils/chunkText');
const { getRelevantChunks } = require('../services/retrievalService');
const { askAI } = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { invalidateUserCache } = require('../middleware/responseCache');
const fs = require('fs');
const path = require('path');

// ─── Upload PDF ───────────────────────────────────────────────
// POST /api/ai/upload
exports.uploadPDF = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        throw new AppError('Please upload a PDF file', 400);
    }

    // Read the PDF from the newly saved disk location
    const buffer = await fs.promises.readFile(req.file.path);
    const text = await extractTextFromPDF(buffer);
    const chunks = chunkText(text);

    const doc = await Document.create({
        user: req.user.id,
        filename: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        chunks,
    });
    invalidateUserCache(req.user.id);

    res.status(201).json({
        success: true,
        message: 'PDF uploaded and processed successfully',
        data: {
            id: doc._id,
            filename: doc.filename,
            fileUrl: doc.fileUrl,
            totalChunks: doc.chunks.length,
        },
    });
});

// ─── Get User Documents ───────────────────────────────────────
// GET /api/ai
exports.getDocuments = asyncHandler(async (req, res, next) => {
    // Select everything except the heavy chunks array
    const docs = await Document.find({ user: req.user.id }).select('-chunks').sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: docs.length,
        data: docs,
    });
});

// ─── Delete Document ──────────────────────────────────────────
// DELETE /api/ai/:id
exports.deleteDocument = asyncHandler(async (req, res, next) => {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user.id });

    if (!doc) {
        throw new AppError('Document not found or unauthorized', 404);
    }

    // Attempt to delete physical file from disk
    if (doc.fileUrl) {
        const filename = doc.fileUrl.split('/uploads/')[1];
        const filePath = path.join(__dirname, '../uploads', filename);
        try {
            if (filePath && fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        } catch (err) {
            console.error('Error deleting physical file:', err);
        }
    }

    await Document.deleteOne({ _id: doc._id });
    invalidateUserCache(req.user.id);

    res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
    });
});


// ─── Chat with AI ─────────────────────────────────────────────
// POST /api/ai/chat
exports.chatWithAI = asyncHandler(async (req, res, next) => {
    const { question, documentIds } = req.body;

    if (!question || !question.trim()) {
        throw new AppError('Please provide a question', 400);
    }

    const allChunks = [];

    // If specific documents are selected, only search those
    if (documentIds && documentIds.length > 0) {
        const docs = await Document.find({ _id: { $in: documentIds }, user: req.user.id });
        docs.forEach((doc) => allChunks.push(...doc.chunks));
    } else {
        // Default: use all documents + notes
        const docs = await Document.find({ user: req.user.id });
        const notes = await Note.find({ user: req.user.id });
        docs.forEach((doc) => allChunks.push(...doc.chunks));
        notes.forEach((note) => {
            allChunks.push(...chunkText(note.content));
        });
    }

    if (!allChunks.length) {
        return res.status(200).json({
            success: true,
            answer: 'You have no notes or documents to search. Please create a note or upload a PDF first.',
        });
    }

    const relevantChunks = getRelevantChunks(allChunks, question);

    if (!relevantChunks.length) {
        return res.status(200).json({
            success: true,
            answer: 'Answer not found in the provided documents.',
        });
    }

    const answer = await askAI(relevantChunks, question);

    res.status(200).json({
        success: true,
        answer,
    });
});
