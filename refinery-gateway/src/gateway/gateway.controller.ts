import {
  Controller,
  All,
  Get,
  Req,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { JwtOrApiKeyGuard } from '../auth/guards/jwt-or-api-key.guard';
import { ScopesGuard } from '../auth/guards/scopes.guard';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard';
import { GatewayService } from './gateway.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Controller()
export class GatewayController {
  constructor(
    private gatewayService: GatewayService,
    private analyticsService: AnalyticsService,
  ) {}

  @Get('health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @All('api/va-knowledge/*')
  @UseGuards(JwtOrApiKeyGuard, ScopesGuard, RateLimitGuard)
  async proxyVaKnowledge(@Req() req: Request, @Res() res: Response) {
    return this.proxyRequest(req, res, 'VA_KNOWLEDGE_SERVICE_URL');
  }

  @All('api/forms/*')
  @UseGuards(JwtOrApiKeyGuard, ScopesGuard, RateLimitGuard)
  async proxyForms(@Req() req: Request, @Res() res: Response) {
    return this.proxyRequest(req, res, 'FORMS_SERVICE_URL');
  }

  @All('api/processor/*')
  @UseGuards(JwtOrApiKeyGuard, ScopesGuard, RateLimitGuard)
  async proxyProcessor(@Req() req: Request, @Res() res: Response) {
    return this.proxyRequest(req, res, 'PROCESSOR_SERVICE_URL');
  }

  @All('api/v1/storage/*')
  async proxyStorage(@Req() req: Request, @Res() res: Response) {
    return this.proxyRequest(req, res, 'REFINERY_API_SERVICE_URL');
  }

  @All('api/v1/*')
  async proxyApiV1(@Req() req: Request, @Res() res: Response) {
    return this.proxyRequest(req, res, 'VA_KNOWLEDGE_SERVICE_URL');
  }

  private async proxyRequest(
    req: Request,
    res: Response,
    serviceUrlKey: string,
  ) {
    const startTime = Date.now();

    try {
      const result = await this.gatewayService.proxyRequest(
        req,
        serviceUrlKey,
      );

      const responseTime = Date.now() - startTime;

      // Log request
      await this.analyticsService.logRequest({
        method: req.method,
        path: req.path,
        statusCode: result.status,
        responseTime,
        userId: (req as any).user?.userId,
        apiKeyId: (req as any).user?.keyId,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      // Set headers and send response
      Object.keys(result.headers).forEach((key) => {
        res.setHeader(key, result.headers[key]);
      });

      return res.status(result.status).send(result.data);
    } catch (error) {
      const responseTime = Date.now() - startTime;

      await this.analyticsService.logRequest({
        method: req.method,
        path: req.path,
        statusCode: error.status || 500,
        responseTime,
        userId: (req as any).user?.userId,
        apiKeyId: (req as any).user?.keyId,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        errorMessage: error.message,
      });

      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
