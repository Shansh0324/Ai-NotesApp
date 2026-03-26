const express = require('express');
const router = express.Router();

const {
    createNote,
    getNotes,
    getNote,
    updateNote,
    deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');
const { validateNote, validateNoteUpdate } = require('../middleware/validate');
const { responseCache } = require('../middleware/responseCache');

// All routes below are protected
router.use(protect);

router
    .route('/')
    .get(responseCache(15), getNotes)
    .post(validateNote, createNote);

router
    .route('/:id')
    .get(responseCache(15), getNote)
    .put(validateNoteUpdate, updateNote)
    .delete(deleteNote);

module.exports = router;
