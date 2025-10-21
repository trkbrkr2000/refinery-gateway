import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPES_KEY } from '../decorators/require-scopes.decorator';
import { SwaggerScopeExtractorService } from '../swagger-scope-extractor.service';
import { findRequiredScopes, hasRequiredScopes } from '../scope-mapping';

/**
 * Guard that enforces API key scopes
 * Checks if the authenticated user has the required scopes
 *
 * Three modes (in order of precedence):
 * 1. Decorator-based: Uses @RequireScopes() decorator (for direct routes)
 * 2. Swagger-based: Uses x-required-scopes from Swagger docs (automatic)
 * 3. Fallback: Uses hardcoded scope mapping config
 *
 * Notes:
 * - JWT authentication bypasses scope checks (full access)
 * - API key authentication requires scopes to match
 * - Multiple scopes = ANY match required (OR logic)
 */
@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private scopeExtractor: SwaggerScopeExtractorService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // User not authenticated (shouldn't happen if JwtOrApiKeyGuard is used)
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // JWT users have full access (bypass scope checks)
    if (user.authMethod === 'jwt') {
      return true;
    }

    // API key users must have matching scopes
    if (user.authMethod === 'api-key') {
      const userScopes = user.scopes || [];

      // Try decorator-based scopes first
      let requiredScopes = this.reflector.getAllAndOverride<string[]>(
        SCOPES_KEY,
        [context.getHandler(), context.getClass()],
      );

      // If no decorator, try Swagger-based scopes
      if (!requiredScopes || requiredScopes.length === 0) {
        requiredScopes = this.scopeExtractor.findRequiredScopes(
          request.method,
          request.path,
        );
      }

      // If still no scopes, try hardcoded mapping (fallback)
      if (!requiredScopes || requiredScopes.length === 0) {
        requiredScopes = findRequiredScopes(request.method, request.path);
      }

      // No scopes required = allow access
      if (!requiredScopes || requiredScopes.length === 0) {
        return true;
      }

      // Check if user has required scopes (use extractor's method for wildcard support)
      if (!this.scopeExtractor.hasRequiredScopes(userScopes, requiredScopes)) {
        throw new ForbiddenException(
          `Insufficient permissions. Required scopes: ${requiredScopes.join(' OR ')}. Your scopes: ${userScopes.join(', ') || 'none'}`,
        );
      }

      return true;
    }

    // Unknown auth method
    throw new ForbiddenException('Invalid authentication method');
  }
}
