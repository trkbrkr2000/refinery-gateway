import { Injectable } from '@nestjs/common';

/**
 * Route-to-Scope mapping extracted from Swagger docs
 */
export interface ScopeMapping {
  method: string;
  path: string;
  scopes: string[];
}

/**
 * Service for extracting and managing scopes from Swagger documentation
 *
 * This allows backend services to define their scope requirements in Swagger,
 * and the gateway automatically enforces them without manual configuration.
 */
@Injectable()
export class SwaggerScopeExtractorService {
  private scopeMappings: ScopeMapping[] = [];

  /**
   * Extract scope requirements from a merged Swagger document
   *
   * Looks for custom extension: x-required-scopes
   *
   * Example Swagger definition:
   * ```yaml
   * paths:
   *   /api/forms:
   *     get:
   *       x-required-scopes: ['forms:read']
   *     post:
   *       x-required-scopes: ['forms:write', 'forms:admin']
   * ```
   */
  extractScopesFromSwagger(swaggerDoc: any): ScopeMapping[] {
    const mappings: ScopeMapping[] = [];

    if (!swaggerDoc?.paths) {
      return mappings;
    }

    Object.entries(swaggerDoc.paths).forEach(([path, pathItem]: [string, any]) => {
      // Check each HTTP method
      ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].forEach((method) => {
        const operation = pathItem[method];
        if (!operation) return;

        // Look for x-required-scopes extension
        const scopes = operation['x-required-scopes'];
        if (scopes && Array.isArray(scopes) && scopes.length > 0) {
          mappings.push({
            method: method.toUpperCase(),
            path,
            scopes,
          });
        }
      });
    });

    return mappings;
  }

  /**
   * Update the scope mappings (called when Swagger docs are refreshed)
   */
  updateScopeMappings(swaggerDoc: any): void {
    this.scopeMappings = this.extractScopesFromSwagger(swaggerDoc);
    console.log(`✅ Extracted ${this.scopeMappings.length} scope mappings from Swagger docs`);
  }

  /**
   * Find required scopes for a given request
   */
  findRequiredScopes(method: string, path: string): string[] {
    // Try exact match first
    const exactMatch = this.scopeMappings.find(
      (mapping) => mapping.method === method && mapping.path === path,
    );

    if (exactMatch) {
      return exactMatch.scopes;
    }

    // Try pattern matching for parameterized routes
    // Convert Swagger path parameters to regex
    // e.g., /api/forms/{id} -> /api/forms/[^/]+
    const matchingMapping = this.scopeMappings.find((mapping) => {
      if (mapping.method !== method) return false;

      // Convert Swagger path to regex pattern
      const pattern = mapping.path
        .replace(/\{[^}]+\}/g, '[^/]+') // Replace {id} with [^/]+
        .replace(/\//g, '\\/'); // Escape slashes

      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    });

    return matchingMapping?.scopes || [];
  }

  /**
   * Get all scope mappings (for debugging/admin purposes)
   */
  getAllScopeMappings(): ScopeMapping[] {
    return this.scopeMappings;
  }

  /**
   * Check if user has required scopes
   */
  hasRequiredScopes(userScopes: string[], requiredScopes: string[]): boolean {
    if (!requiredScopes || requiredScopes.length === 0) {
      return true; // No scopes required
    }

    if (!userScopes || userScopes.length === 0) {
      return false; // User has no scopes but some are required
    }

    // Check if user has ANY of the required scopes (OR logic)
    return requiredScopes.some((required) => {
      // Exact match
      if (userScopes.includes(required)) {
        return true;
      }

      // Wildcard match (e.g., admin:* matches admin:users)
      if (required.includes('*')) {
        const pattern = required.replace('*', '.*');
        const regex = new RegExp(`^${pattern}$`);
        return userScopes.some((userScope) => regex.test(userScope));
      }

      // Check if user has wildcard that matches required
      const userWildcard = userScopes.find((scope) => scope.includes('*'));
      if (userWildcard) {
        const pattern = userWildcard.replace('*', '.*');
        const regex = new RegExp(`^${pattern}$`);
        if (regex.test(required)) {
          return true;
        }
      }

      return false;
    });
  }
}
