import { Redis } from '@upstash/redis'

// Check if Redis credentials are available
const hasRedisConfig = !!(process.env.REDIS_URL && process.env.REDIS_TOKEN);

/**
 * Redis client for caching data to improve performance
 * - Reduces database load
 * - Improves response times
 * - Handles high-traffic scenarios efficiently
 */
const redis = hasRedisConfig 
  ? new Redis({
      url: process.env.REDIS_URL || '',
      token: process.env.REDIS_TOKEN || '',
    })
  : null;

/**
 * Generic cache helper function
 * @param key Cache key
 * @param fetchData Function to fetch data if not in cache
 * @param ttl Time to live in seconds (default: 1 hour)
 */
export async function getOrSet<T>(
  key: string,
  fetchData: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // If Redis is not configured, just fetch data directly
  if (!redis) {
    console.log('Redis not configured, fetching data directly');
    return fetchData();
  }
  
  try {
    // Try to get data from cache first
    const cachedData = await redis.get<T>(key);
    
    // If found in cache, return it
    if (cachedData !== null) {
      console.log(`Cache hit for key: ${key}`);
      return cachedData;
    }
    
    // If not in cache, fetch fresh data
    console.log(`Cache miss for key: ${key}, fetching data...`);
    const freshData = await fetchData();
    
    // Store in cache with expiration
    await redis.set(key, freshData, { ex: ttl });
    
    return freshData;
  } catch (error) {
    // If Redis fails, fallback to direct data fetch
    console.error('Redis cache error:', error);
    return fetchData();
  }
}

/**
 * Invalidate a specific cache key
 * @param key Cache key to invalidate
 */
export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return;
  
  try {
    await redis.del(key);
    console.log(`Cache invalidated for key: ${key}`);
  } catch (error) {
    console.error(`Failed to invalidate cache for key: ${key}`, error);
  }
}

/**
 * Invalidate multiple cache keys by pattern
 * @param pattern Pattern to match keys (e.g., "products:*")
 */
export async function invalidateCacheByPattern(pattern: string): Promise<void> {
  if (!redis) return;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error(`Failed to invalidate cache for pattern: ${pattern}`, error);
  }
}

export default redis; 