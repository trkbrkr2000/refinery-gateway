import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Guard that accepts EITHER JWT token OR API key
 * Checks Authorization header first (JWT), then x-api-key header
 */
@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Try JWT first
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        // Verify JWT
        const payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
        });

        // Attach user to request
        request.user = {
          userId: payload.sub,
          email: payload.email,
          roles: payload.roles,
          authMethod: 'jwt',
        };

        return true;
      } catch (error) {
        // JWT invalid, fall through to try API key
      }
    }

    // Try API key
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      try {
        const result = await this.authService.validateApiKey(apiKey);

        // Attach user to request
        request.user = {
          userId: result.userId,
          scopes: result.scopes,
          keyId: result.keyId,
          authMethod: 'api-key',
        };

        return true;
      } catch (error) {
        // API key invalid, fall through to error
      }
    }

    // Neither JWT nor API key provided/valid
    throw new UnauthorizedException(
      'Authentication required. Provide either a valid JWT token (Authorization: Bearer <token>) or API key (x-api-key: <key>)',
    );
  }
}
