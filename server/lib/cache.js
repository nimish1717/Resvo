const redis = require('./redisClient');

const HALLS_CACHE_KEY = 'halls:approved';
const HALLS_CACHE_TTL_SECONDS = 300;

const getCachedHalls = async () => {
    try {
        const cached = await redis.get(HALLS_CACHE_KEY);
        if (cached) {
            return {
                status: true,
                message: 'Cache hit',
                data: JSON.parse(cached)
            };
        }
        return {
            status: false,
            message: 'Cache miss',
            data: null
        };
    } catch (err) {
        return {
            status: false,
            message: 'Redis read error',
            error: err.message
        };
    }
};

const setCachedHalls = async (halls) => {
    try {
        await redis.set(HALLS_CACHE_KEY, JSON.stringify(halls), 'EX', HALLS_CACHE_TTL_SECONDS);
        return {
            status: true,
            message: 'Cache set successfully'
        };
    } catch (err) {
        return {
            status: false,
            message: 'Redis write error',
            error: err.message
        };
    }
};

const invalidateHallsCache = async () => {
    try {
        await redis.del(HALLS_CACHE_KEY);
        return {
            status: true,
            message: 'Cache invalidated successfully'
        };
    } catch (err) {
        return {
            status: false,
            message: 'Redis invalidation error',
            error: err.message
        };
    }
};

const invalidateSearchCache = async () => {
    try {
        const keys = await redis.keys("halls:search:*");
        if (keys.length > 0) {
            await redis.unlink(keys);
        }
        return {
            status: true,
            message: 'Search cache invalidated successfully'
        };
    } catch (err) {
        return {
            status: false,
            message: 'Redis search invalidation error',
            error: err.message
        };
    }
};

module.exports = { getCachedHalls, setCachedHalls, invalidateHallsCache, invalidateSearchCache };
