import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { SwaggerMergerService } from './swagger-merger.service';
import { AuthModule } from '../auth/auth.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Global()
@Module({
  imports: [HttpModule, AuthModule, RateLimitModule, AnalyticsModule],
  controllers: [GatewayController],
  providers: [GatewayService, SwaggerMergerService],
  exports: [SwaggerMergerService],
})
export class GatewayModule {}
