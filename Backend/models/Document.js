const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        filename: {
            type: String,
            required: [true, 'Please provide a filename'],
            trim: true,
        },
        fileUrl: {
            type: String,
            required: [true, 'Please provide a file URL'],
        },
        chunks: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

// Index for efficient user-based queries
documentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
