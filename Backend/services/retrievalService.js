/**
 * Filters chunks that are relevant to the user's question
 * using keyword-based matching.
 * @param {string[]} chunks - All available text chunks.
 * @param {string} question - The user's question.
 * @param {number} maxChunks - Maximum number of chunks to return (default 5).
 * @returns {string[]} Relevant chunks.
 */
const getRelevantChunks = (chunks, question, maxChunks = 5) => {
    const words = question
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 2); // Ignore very short words

    return chunks
        .filter((chunk) =>
            words.some((word) => chunk.toLowerCase().includes(word))
        )
        .slice(0, maxChunks);
};

module.exports = { getRelevantChunks };
