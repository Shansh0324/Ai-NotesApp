const Note = require('../models/Note');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { invalidateUserCache } = require('../middleware/responseCache');

// ─── Create Note ──────────────────────────────────────────────
// POST /api/notes
exports.createNote = asyncHandler(async (req, res, next) => {
    // Attach the logged-in user
    req.body.user = req.user.id;

    const note = await Note.create(req.body);
    invalidateUserCache(req.user.id);

    res.status(201).json({
        success: true,
        data: note,
    });
});

// ─── Get All Notes (for current user) ─────────────────────────
// GET /api/notes
exports.getNotes = asyncHandler(async (req, res, next) => {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: notes.length,
        data: notes,
    });
});

// ─── Get Single Note ──────────────────────────────────────────
// GET /api/notes/:id
exports.getNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        throw new AppError('Note not found', 404);
    }

    // Ensure note belongs to the user
    if (note.user.toString() !== req.user.id) {
        throw new AppError('Not authorized to access this note', 403);
    }

    res.status(200).json({
        success: true,
        data: note,
    });
});

// ─── Update Note ──────────────────────────────────────────────
// PUT /api/notes/:id
exports.updateNote = asyncHandler(async (req, res, next) => {
    let note = await Note.findById(req.params.id);

    if (!note) {
        throw new AppError('Note not found', 404);
    }

    // Ensure note belongs to the user
    if (note.user.toString() !== req.user.id) {
        throw new AppError('Not authorized to update this note', 403);
    }

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    invalidateUserCache(req.user.id);

    res.status(200).json({
        success: true,
        data: note,
    });
});

// ─── Delete Note ──────────────────────────────────────────────
// DELETE /api/notes/:id
exports.deleteNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        throw new AppError('Note not found', 404);
    }

    // Ensure note belongs to the user
    if (note.user.toString() !== req.user.id) {
        throw new AppError('Not authorized to delete this note', 403);
    }

    await Note.findByIdAndDelete(req.params.id);
    invalidateUserCache(req.user.id);

    res.status(200).json({
        success: true,
        message: 'Note deleted successfully',
    });
});
