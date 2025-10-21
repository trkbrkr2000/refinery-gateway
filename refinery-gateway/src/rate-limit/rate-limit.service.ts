import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

export class RateLimitRecord {
  _id?: string;
  key: string;
  count: number;
  resetAt: Date;
}

@Injectable()
export class RateLimitService {
  private readonly windowMs: number;
  private readonly maxRequests: number;

  // Fallback in-memory storage if Redis unavailable
  private records: Map<string, RateLimitRecord> = new Map();

  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {
    this.windowMs = parseInt(
      this.configService.get<string>('RATE_LIMIT_TTL') || '60000'
    );
    this.maxRequests = parseInt(
      this.configService.get<string>('RATE_LIMIT_MAX') || '100'
    );
  }

  async checkLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const rateLimitKey = `ratelimit:${key}`;

    if (this.redisService.isConnected) {
      return this.checkLimitRedis(rateLimitKey);
    } else {
      return this.checkLimitMemory(key);
    }
  }

  private async checkLimitRedis(key: string): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const now = Date.now();
    const resetAt = new Date(now + this.windowMs);

    // Atomic increment
    const count = await this.redisService.incrementRateLimit(key, this.windowMs);

    if (count > this.maxRequests) {
      const ttl = await this.redisService.getRateLimitTTL(key);
      const actualResetAt = ttl > 0 ? new Date(now + ttl) : resetAt;

      return {
        allowed: false,
        remaining: 0,
        resetAt: actualResetAt,
      };
    }

    return {
      allowed: true,
      remaining: this.maxRequests - count,
      resetAt,
    };
  }

  private async checkLimitMemory(key: string): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const now = new Date();
    const resetAt = new Date(now.getTime() + this.windowMs);

    const record = await this.getOrCreateRecord(key, resetAt);

    if (record.resetAt < now) {
      // Reset window
      record.count = 1;
      record.resetAt = resetAt;
      await this.updateRecord(record);
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetAt,
      };
    }

    if (record.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt,
      };
    }

    record.count++;
    await this.updateRecord(record);

    return {
      allowed: true,
      remaining: this.maxRequests - record.count,
      resetAt: record.resetAt,
    };
  }

  private async getOrCreateRecord(key: string, resetAt: Date): Promise<RateLimitRecord> {
    if (!this.records.has(key)) {
      this.records.set(key, {
        key,
        count: 0,
        resetAt,
      });
    }
    return this.records.get(key)!;
  }

  private async updateRecord(record: RateLimitRecord): Promise<void> {
    this.records.set(record.key, record);
  }

  async cleanupExpired(): Promise<void> {
    const now = new Date();
    for (const [key, record] of this.records.entries()) {
      if (record.resetAt < now) {
        this.records.delete(key);
      }
    }
  }
}
