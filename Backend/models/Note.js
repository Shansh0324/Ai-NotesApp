const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        content: {
            type: String,
            required: [true, 'Please provide content'],
            trim: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// Index for efficient user-based queries
noteSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
