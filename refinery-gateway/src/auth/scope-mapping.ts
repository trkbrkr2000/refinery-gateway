/**
 * Scope Mapping Configuration
 *
 * Maps HTTP methods and URL patterns to required scopes
 * This allows the gateway to enforce scopes without decorators
 */

export interface ScopeRule {
  method: string | string[]; // HTTP method(s)
  pathPattern: RegExp; // URL pattern to match
  scopes: string[]; // Required scopes (OR logic)
  description?: string;
}

export const SCOPE_RULES: ScopeRule[] = [
  // Forms Service
  {
    method: 'GET',
    pathPattern: /^\/api\/forms/,
    scopes: ['forms:read'],
    description: 'Read forms',
  },
  {
    method: ['POST', 'PUT', 'PATCH'],
    pathPattern: /^\/api\/forms/,
    scopes: ['forms:write', 'forms:admin'],
    description: 'Create/update forms',
  },
  {
    method: 'DELETE',
    pathPattern: /^\/api\/forms/,
    scopes: ['forms:delete', 'forms:admin'],
    description: 'Delete forms',
  },

  // VA Knowledge Service
  {
    method: 'GET',
    pathPattern: /^\/api\/va-knowledge\/search/,
    scopes: ['va-knowledge:search'],
    description: 'Search VA knowledge',
  },
  {
    method: 'GET',
    pathPattern: /^\/api\/va-knowledge/,
    scopes: ['va-knowledge:read'],
    description: 'Read VA knowledge',
  },
  {
    method: 'POST',
    pathPattern: /^\/api\/va-knowledge\/analyze/,
    scopes: ['va-knowledge:analyze', 'va-knowledge:admin'],
    description: 'Analyze VA content',
  },

  // Document Processor
  {
    method: 'POST',
    pathPattern: /^\/api\/processor\/upload/,
    scopes: ['processor:upload', 'processor:admin'],
    description: 'Upload documents',
  },
  {
    method: 'POST',
    pathPattern: /^\/api\/processor\/process/,
    scopes: ['processor:process', 'processor:admin'],
    description: 'Process documents',
  },
  {
    method: 'GET',
    pathPattern: /^\/api\/processor/,
    scopes: ['processor:read'],
    description: 'Read processing results',
  },

  // Admin endpoints (if exposed through gateway)
  {
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    pathPattern: /^\/api\/admin/,
    scopes: ['admin:*'],
    description: 'Admin operations',
  },
];

/**
 * Find required scopes for a given request
 */
export function findRequiredScopes(method: string, path: string): string[] {
  const matchingRule = SCOPE_RULES.find((rule) => {
    const methodMatches = Array.isArray(rule.method)
      ? rule.method.includes(method)
      : rule.method === method;

    const pathMatches = rule.pathPattern.test(path);

    return methodMatches && pathMatches;
  });

  return matchingRule?.scopes || [];
}

/**
 * Check if user has required scopes
 */
export function hasRequiredScopes(
  userScopes: string[],
  requiredScopes: string[],
): boolean {
  if (!requiredScopes || requiredScopes.length === 0) {
    return true; // No scopes required
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

    return false;
  });
}
