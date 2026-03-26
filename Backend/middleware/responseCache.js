/**
 * Simple in-memory per-user response cache for GET endpoints.
 * Used to avoid redundant DB queries on frequently-hit routes.
 *
 * Usage:
 *   app.get('/api/notes', protect, responseCache(60), getNotes);
 *
 * Cache key = userId + originalUrl
 * TTL is in seconds.
 */
const cache = new Map();

const responseCache = (ttlSeconds = 30) => {
    return (req, res, next) => {
        // Only cache GET requests from authenticated users
        if (req.method !== 'GET' || !req.user) {
            return next();
        }

        const key = `${req.user.id}:${req.originalUrl}`;
        const cached = cache.get(key);

        if (cached && (Date.now() - cached.timestamp < ttlSeconds * 1000)) {
            return res.status(200).json(cached.data);
        }

        // Intercept res.json to cache the response
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            cache.set(key, { data, timestamp: Date.now() });
            return originalJson(data);
        };

        next();
    };
};

/**
 * Invalidate all cached entries for a specific user.
 * Call this after mutations (create, update, delete).
 */
const invalidateUserCache = (userId) => {
    for (const key of cache.keys()) {
        if (key.startsWith(`${userId}:`)) {
            cache.delete(key);
        }
    }
};

// Periodic cleanup of expired entries (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache) {
        if (now - entry.timestamp > 5 * 60 * 1000) {
            cache.delete(key);
        }
    }
}, 5 * 60 * 1000);

module.exports = { responseCache, invalidateUserCache };
