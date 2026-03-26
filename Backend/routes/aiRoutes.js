const express = require('express');
const router = express.Router();

const { uploadPDF, chatWithAI, getDocuments, deleteDocument } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');
const { responseCache } = require('../middleware/responseCache');

// All routes below are protected
router.use(protect);

router.get('/', responseCache(30), getDocuments);
router.delete('/:id', deleteDocument);
router.post('/upload', upload.single('file'), uploadPDF);
router.post('/chat', chatWithAI);

module.exports = router;
