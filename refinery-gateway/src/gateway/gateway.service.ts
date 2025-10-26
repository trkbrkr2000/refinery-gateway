import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async proxyRequest(req: Request, serviceUrlKey: string) {
    const serviceUrl = this.configService.get<string>(serviceUrlKey);

    if (!serviceUrl) {
      throw new HttpException(
        `Service ${serviceUrlKey} not configured`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Build target URL
    // Gateway route: /api/forms/* -> Backend route: /api/forms/*
    // Gateway route: /api/va-knowledge/* -> Backend route: /api/va-knowledge/*
    let targetPath = req.path;
    if (targetPath.startsWith('/api/forms')) {
      targetPath = targetPath.replace('/api/forms', '/api/forms');
    } else if (targetPath.startsWith('/api/va-knowledge')) {
      targetPath = targetPath.replace('/api/va-knowledge', '/api/va-knowledge');
    } else if (targetPath.startsWith('/api/processor')) {
      targetPath = targetPath.replace('/api/processor', '/api/processor');
    }
    const targetUrl = `${serviceUrl}${targetPath}`;

    try {
      // Forward request to backend service
      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method,
          url: targetUrl,
          data: req.body,
          headers: this.buildHeaders(req),
          params: req.query,
          maxRedirects: 5,
          timeout: 30000, // 30 second timeout
          validateStatus: () => true, // Don't throw on any status
          // Omit 'family' to let Node.js auto-select IP version (fixes Railway internal DNS)
        }),
      );

      return {
        status: response.status,
        data: response.data,
        headers: this.filterHeaders(response.headers),
      };
    } catch (error) {
      console.error('Proxy request failed:', error.message);
      throw new HttpException(
        'Failed to reach backend service',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private buildHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {};

    // Forward important headers
    const headersToForward = [
      'content-type',
      'accept',
      'user-agent',
      'accept-encoding',
      'accept-language',
    ];

    headersToForward.forEach((header) => {
      if (req.headers[header]) {
        headers[header] = req.headers[header] as string;
      }
    });

    // Add user context headers
    if ((req as any).user) {
      headers['x-user-id'] = (req as any).user.userId;
      if ((req as any).user.keyId) {
        headers['x-api-key-id'] = (req as any).user.keyId;
      }
    }

    return headers;
  }

  private filterHeaders(headers: Record<string, any>): Record<string, string> {
    const filtered: Record<string, string> = {};

    // Only forward safe headers
    const headersToForward = [
      'content-type',
      'content-length',
      'cache-control',
      'expires',
      'etag',
    ];

    headersToForward.forEach((header) => {
      if (headers[header]) {
        filtered[header] = headers[header];
      }
    });

    return filtered;
  }
}
