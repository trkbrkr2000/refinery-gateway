import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../../redis/redis.service';
import { Request } from 'express';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly cacheTTL = 60 * 1000; // 1 minute default

  constructor(private redisService: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Build cache key from path and query
    const cacheKey = this.buildCacheKey(request);

    // Try to get cached response
    const cachedResponse = await this.redisService.getCachedResponse(cacheKey);

    if (cachedResponse) {
      console.log(`[Cache] HIT: ${cacheKey}`);
      return of(cachedResponse);
    }

    console.log(`[Cache] MISS: ${cacheKey}`);

    // If not cached, proceed with request and cache the response
    return next.handle().pipe(
      tap(async (response) => {
        // Only cache successful responses
        if (response && response.status < 400) {
          await this.redisService.setCachedResponse(
            cacheKey,
            response,
            this.cacheTTL,
          );
        }
      }),
    );
  }

  private buildCacheKey(request: Request): string {
    const userId = (request as any).user?.userId || 'anonymous';
    const path = request.path;
    const query = JSON.stringify(request.query);
    return `cache:${userId}:${path}:${query}`;
  }
}
