import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redis: Redis | null = null;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    // Try to get Redis client from cache manager
    const store: any = (this.cacheManager as any).store;
    if (store && store.client) {
      this.redis = store.client;
      console.log('✅ Redis connected');
    } else {
      console.warn('⚠️  Redis not available - using in-memory fallback');
    }
  }

  get isConnected(): boolean {
    return this.redis !== null && this.redis.status === 'ready';
  }

  // ========== Rate Limiting ==========

  async incrementRateLimit(key: string, ttlMs: number): Promise<number> {
    if (!this.redis) {
      // Fallback to cache manager (in-memory)
      const current = (await this.cacheManager.get<number>(key)) || 0;
      const newCount = current + 1;
      await this.cacheManager.set(key, newCount, ttlMs);
      return newCount;
    }

    // Use Redis for atomic increment
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.pexpire(key, ttlMs);
    }
    return count;
  }

  async getRateLimitCount(key: string): Promise<number> {
    if (!this.redis) {
      return (await this.cacheManager.get<number>(key)) || 0;
    }
    return parseInt((await this.redis.get(key)) || '0', 10);
  }

  async getRateLimitTTL(key: string): Promise<number> {
    if (!this.redis) {
      return 0; // Can't get TTL from cache-manager easily
    }
    return await this.redis.pttl(key);
  }

  // ========== Token Blacklist ==========

  async blacklistToken(token: string, expiresInMs: number): Promise<void> {
    const key = `blacklist:${token}`;
    if (!this.redis) {
      await this.cacheManager.set(key, true, expiresInMs);
      return;
    }
    await this.redis.set(key, '1', 'PX', expiresInMs);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;
    if (!this.redis) {
      return (await this.cacheManager.get(key)) !== undefined;
    }
    const result = await this.redis.get(key);
    return result !== null;
  }

  // ========== Response Caching ==========

  async getCachedResponse(key: string): Promise<any> {
    return await this.cacheManager.get(key);
  }

  async setCachedResponse(key: string, value: any, ttlMs: number): Promise<void> {
    await this.cacheManager.set(key, value, ttlMs);
  }

  async deleteCachedResponse(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async clearCache(): Promise<void> {
    await this.cacheManager.reset();
  }

  // ========== Generic Operations ==========

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttlMs?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttlMs);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) {
      return (await this.cacheManager.get(key)) !== undefined;
    }
    return (await this.redis.exists(key)) === 1;
  }

  // ========== Pub/Sub (Redis only) ==========

  async publish(channel: string, message: string): Promise<number> {
    if (!this.redis) {
      console.warn('Pub/Sub requires Redis - message not published');
      return 0;
    }
    return await this.redis.publish(channel, message);
  }

  subscribe(channel: string, callback: (message: string) => void): void {
    if (!this.redis) {
      console.warn('Pub/Sub requires Redis - subscription not created');
      return;
    }
    const subscriber = this.redis.duplicate();
    subscriber.subscribe(channel);
    subscriber.on('message', (ch, msg) => {
      if (ch === channel) callback(msg);
    });
  }
}
