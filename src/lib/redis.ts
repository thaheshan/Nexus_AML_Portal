import Redis from 'ioredis';

// Wrap in a try-catch or provide a dummy client if Redis is not available locally for the take-home task
let redis: Redis | null = null;

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('Redis connection failed, continuing without cache');
        return null; // Stop retrying
      }
      return Math.min(times * 50, 2000);
    }
  });
} catch (error) {
  console.warn('Failed to initialize Redis client', error);
}

export default redis;
