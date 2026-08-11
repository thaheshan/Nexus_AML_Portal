import { Redis } from 'ioredis';
import redis from '@/lib/redis';

// Simple sliding window / fixed window rate limiter using Redis
// Fallback to in-memory map if Redis is not connected / available
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function rateLimit(
  identifier: string,
  limit: number = 5,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const resetAt = Math.ceil((now + windowSeconds * 1000) / 1000);

  // Try Redis first
  if (redis && redis.status === 'ready') {
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      const ttl = await redis.ttl(key);
      const remaining = Math.max(0, limit - current);

      return {
        success: current <= limit,
        limit,
        remaining,
        reset: now + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000),
      };
    } catch (err) {
      console.warn('Redis rate limiting error, falling back to in-memory store:', err);
    }
  }

  // Fallback in-memory rate limiting
  const record = inMemoryStore.get(key);

  if (!record || record.resetAt <= now) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowSeconds * 1000,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);

  return {
    success: record.count <= limit,
    limit,
    remaining,
    reset: record.resetAt,
  };
}
