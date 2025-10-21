import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');

        if (!redisUrl) {
          console.warn('⚠️  REDIS_URL not set - using in-memory cache (not recommended for production)');
          return {
            ttl: 60 * 1000, // 1 minute default
          } as any;
        }

        const store = await redisStore({
          url: redisUrl,
          ttl: 60 * 1000, // 1 minute default
        });

        return {
          store: store as any,
          ttl: 60 * 1000,
        } as any;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  exports: [RedisService, CacheModule],
})
export class RedisModule {}
