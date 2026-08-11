import redis from './redis';

/**
 * Executes fetcher and caches result in Redis with a TTL.
 * Transparently falls back to fetcher directly if Redis fails or is unavailable.
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  if (!redis) {
    return await fetcher();
  }

  try {
    // Attempt cache read
    const cachedData = await redis.get(key);
    if (cachedData) {
      try {
        return JSON.parse(cachedData) as T;
      } catch {
        // Invalid JSON cache, bypass
      }
    }
  } catch (err) {
    // Redis offline or read error, fallback gracefully
  }

  // Fetch fresh data
  const freshData = await fetcher();

  // Async write cache in background
  if (freshData !== undefined && freshData !== null) {
    try {
      await redis.set(key, JSON.stringify(freshData), 'EX', ttlSeconds);
    } catch {
      // Ignore cache write failures
    }
  }

  return freshData;
}

/**
 * Invalidates keys matching a pattern (or array of exact keys/patterns)
 */
export async function invalidateCache(keysOrPatterns: string | string[]): Promise<void> {
  if (!redis) return;

  const targets = Array.isArray(keysOrPatterns) ? keysOrPatterns : [keysOrPatterns];

  for (const target of targets) {
    try {
      if (target.includes('*')) {
        const keys = await redis.keys(target);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        await redis.del(target);
      }
    } catch {
      // Ignore cache invalidation failures
    }
  }
}
