/**
 * Splits text into word-based chunks.
 * @param {string} text - The text to split.
 * @param {number} size - Number of words per chunk (default 500).
 * @returns {string[]} Array of text chunks.
 */
const chunkText = (text, size = 500) => {
    const words = text.split(/\s+/).filter(Boolean);
    const chunks = [];

    for (let i = 0; i < words.length; i += size) {
        chunks.push(words.slice(i, i + size).join(' '));
    }

    return chunks;
};

module.exports = { chunkText };
