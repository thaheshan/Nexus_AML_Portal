import Redis from 'ioredis';

// Wrap in a try-catch or provide a dummy client if Redis is not available locally
let redis: Redis | null = null;

try {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 2) {
        return null; // Stop retrying quickly to avoid blocking
      }
      return 100;
    }
  });

  redis.on('error', (err) => {
    // Silent warn on connection refusal so app falls back gracefully
    if ((err as any)?.code === 'ECONNREFUSED') {
      // Redis unavailable locally, fallback active
    } else {
      console.warn('[Redis] Connection warning:', err.message);
    }
  });
} catch (error) {
  console.warn('[Redis] Failed to initialize Redis client', error);
}

export default redis;
