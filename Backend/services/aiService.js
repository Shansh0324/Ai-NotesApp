const { model } = require('../config/gemini');
const crypto = require('crypto');

// ─── In-Memory Response Cache ─────────────────────────────────
// Key: hash(question + sorted chunks)  →  Value: { answer, timestamp }
// TTL: 30 minutes — after that, the cached answer expires
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 200;

/**
 * Generates a deterministic cache key from the question and context chunks.
 */
const getCacheKey = (chunks, question) => {
    const raw = question.trim().toLowerCase() + '|' + chunks.sort().join('||');
    return crypto.createHash('sha256').update(raw).digest('hex');
};

/**
 * Evicts expired entries from the cache.
 */
const evictExpired = () => {
    const now = Date.now();
    for (const [key, entry] of cache) {
        if (now - entry.timestamp > CACHE_TTL) {
            cache.delete(key);
        }
    }
};

/**
 * Sends relevant context chunks and a question to Gemini
 * and returns a strict, context-only answer.
 * Uses an in-memory cache to avoid redundant API calls.
 * @param {string[]} chunks - Relevant text chunks.
 * @param {string} question - The user's question.
 * @returns {Promise<string>} AI-generated answer.
 */
const askAI = async (chunks, question) => {
    if (!chunks.length) {
        return 'Answer not found in the provided documents.';
    }

    // Check cache first
    const cacheKey = getCacheKey(chunks, question);
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        console.log('💾 Cache hit — returning cached AI response');
        return cached.answer;
    }

    const context = chunks.join('\n\n');

    const prompt = `
You are a strict AI assistant.

RULES:
- Answer ONLY from the context provided below.
- Do NOT use any external knowledge.
- If the answer is not found in the context, respond with:
  "Answer not found in the provided documents."

Context:
${context}

Question:
${question}
`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    // Store in cache
    evictExpired();
    if (cache.size >= MAX_CACHE_SIZE) {
        // Remove the oldest entry
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
    }
    cache.set(cacheKey, { answer, timestamp: Date.now() });
    console.log('📝 Cached new AI response');

    return answer;
};

module.exports = { askAI };
