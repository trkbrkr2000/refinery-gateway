import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to require specific scopes for an endpoint
 * Used with ScopesGuard to enforce API key permissions
 *
 * @example
 * @RequireScopes('forms:write', 'forms:admin')
 * async createForm() { ... }
 */
export const SCOPES_KEY = 'required_scopes';
export const RequireScopes = (...scopes: string[]) => SetMetadata(SCOPES_KEY, scopes);
