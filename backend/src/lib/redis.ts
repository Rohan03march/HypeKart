import { Redis } from '@upstash/redis';

// Initialize Redis client only if environment variables are provided
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
    })
    : null;

/**
 * Generic fetch wrapper that attempts to get data from Redis cache first,
 * and falls back to running the fetcher function if not found.
 * 
 * @param key The unique cache key
 * @param fetcher The async function to fetch fresh data if cache misses
 * @param ttl Time to live in seconds (default 300s / 5 minutes)
 * @returns The cached or freshly fetched data
 */
export async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300
): Promise<T> {
    // If Redis is not configured, bypass cache entirely
    if (!redis) {
        return fetcher();
    }

    try {
        const cachedData = await redis.get<T>(key);
        if (cachedData !== null) {
            console.log(`[Cache Hit] ${key}`);
            return cachedData;
        }

        console.log(`[Cache Miss] ${key} - Fetching fresh data`);
        const freshData = await fetcher();

        // Only cache if data is valid (not null/undefined)
        if (freshData !== null && freshData !== undefined) {
            // Background cache set to not block the current request
            redis.setex(key, ttl, freshData).catch(err => {
                console.error(`[Redis Error] Failed to set cache for ${key}:`, err);
            });
        }

        return freshData;
    } catch (error) {
        console.warn(`[Redis Error] Cache operation failed for ${key}, falling back to fetcher:`, error);
        return fetcher();
    }
}

/**
 * Manually invalidate a specific cache key
 * @param key The unique cache key to delete
 */
export async function invalidateCache(key: string): Promise<void> {
    if (!redis) return;

    try {
        await redis.del(key);
        console.log(`[Cache Invalidated] ${key}`);
    } catch (error) {
        console.error(`[Redis Error] Failed to invalidate cache for ${key}:`, error);
    }
}
