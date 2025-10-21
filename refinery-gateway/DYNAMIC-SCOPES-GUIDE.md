# Dynamic Scopes with API Gateway

## The Problem

In a traditional API, you can use decorators to define scopes:

```typescript
@Controller('forms')
export class FormsController {
  @Get()
  @RequireScopes('forms:read')
  findAll() { ... }

  @Post()
  @RequireScopes('forms:write')
  create() { ... }
}
```

**But in an API Gateway with dynamic Swagger merging, this doesn't work because:**

1. The gateway only has **generic proxy routes** like `/api/forms/*`
2. The gateway doesn't know the **specific endpoints** in backend services
3. Swagger docs are merged **dynamically at runtime**
4. Decorators can't be applied to routes that don't exist in the gateway

## The Solution: Route-Based Scope Mapping

Instead of decorators, we use a **configuration file** that maps HTTP methods and URL patterns to required scopes.

### 1. Define Scope Rules

**File:** [src/auth/scope-mapping.ts](src/auth/scope-mapping.ts)

```typescript
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
  // ... more rules
];
```

### 2. ScopesGuard Automatically Applies Rules

The `ScopesGuard` automatically:

1. Checks if a `@RequireScopes()` decorator exists (for direct routes)
2. If not, **looks up the route in the scope mapping**
3. Extracts required scopes based on HTTP method and path
4. Validates API key has the required scopes

**File:** [src/auth/guards/scopes.guard.ts](src/auth/guards/scopes.guard.ts)

```typescript
canActivate(context: ExecutionContext): boolean {
  const request = context.switchToHttp().getRequest();

  // JWT users bypass scope checks
  if (user.authMethod === 'jwt') {
    return true;
  }

  // API key users - check scopes
  if (user.authMethod === 'api-key') {
    // Try decorator first
    let requiredScopes = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, ...);

    // Fallback to route mapping
    if (!requiredScopes) {
      requiredScopes = findRequiredScopes(request.method, request.path);
    }

    // Validate scopes
    if (!hasRequiredScopes(userScopes, requiredScopes)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  return true;
}
```

### 3. Proxy Routes Enable ScopesGuard

**File:** [src/gateway/gateway.controller.ts](src/gateway/gateway.controller.ts)

```typescript
@All('api/forms/*')
@UseGuards(JwtOrApiKeyGuard, ScopesGuard, RateLimitGuard)
async proxyForms(@Req() req: Request, @Res() res: Response) {
  return this.proxyRequest(req, res, 'FORMS_SERVICE_URL');
}
```

## How It Works: Example Flow

### Request: `GET /api/forms/123`

1. **JwtOrApiKeyGuard** validates authentication
   - Checks JWT token or API key
   - Attaches `user` object to request with `authMethod` and `scopes`

2. **ScopesGuard** checks permissions
   - Sees `authMethod === 'api-key'`
   - No `@RequireScopes()` decorator found
   - Calls `findRequiredScopes('GET', '/api/forms/123')`
   - Matches rule: `{ method: 'GET', pathPattern: /^\/api\/forms/, scopes: ['forms:read'] }`
   - Returns `['forms:read']`
   - Checks if user has `'forms:read'` in their scopes
   - ✅ Allow or ❌ Deny

3. **RateLimitGuard** applies rate limiting

4. **Proxy** forwards request to backend service

### Request: `POST /api/forms`

Same flow, but matches:
```typescript
{
  method: ['POST', 'PUT', 'PATCH'],
  pathPattern: /^\/api\/forms/,
  scopes: ['forms:write', 'forms:admin'],
}
```

User needs **either** `forms:write` **OR** `forms:admin` (OR logic).

## Scope Matching Logic

### Exact Match
```typescript
userScopes: ['forms:read']
requiredScopes: ['forms:read']
✅ Match
```

### OR Logic (Multiple Required Scopes)
```typescript
userScopes: ['forms:admin']
requiredScopes: ['forms:write', 'forms:admin']
✅ Match (has admin)
```

### Wildcard Support (Future)
```typescript
userScopes: ['admin:*']
requiredScopes: ['admin:users']
✅ Match (wildcard)
```

Currently, wildcards are **partially supported** in the `hasRequiredScopes()` function:

```typescript
// Wildcard match (e.g., admin:* matches admin:users)
if (required.includes('*')) {
  const pattern = required.replace('*', '.*');
  const regex = new RegExp(`^${pattern}$`);
  return userScopes.some((userScope) => regex.test(userScope));
}
```

## Adding New Scopes

### Step 1: Add to Scope Mapping

Edit [src/auth/scope-mapping.ts](src/auth/scope-mapping.ts):

```typescript
export const SCOPE_RULES: ScopeRule[] = [
  // ... existing rules

  // New service
  {
    method: 'GET',
    pathPattern: /^\/api\/my-service/,
    scopes: ['my-service:read'],
    description: 'Read my service data',
  },
  {
    method: ['POST', 'PUT', 'PATCH'],
    pathPattern: /^\/api\/my-service/,
    scopes: ['my-service:write', 'my-service:admin'],
    description: 'Write my service data',
  },
];
```

### Step 2: Add Proxy Route (if needed)

Edit [src/gateway/gateway.controller.ts](src/gateway/gateway.controller.ts):

```typescript
@All('api/my-service/*')
@UseGuards(JwtOrApiKeyGuard, ScopesGuard, RateLimitGuard)
async proxyMyService(@Req() req: Request, @Res() res: Response) {
  return this.proxyRequest(req, res, 'MY_SERVICE_URL');
}
```

### Step 3: Document in Scopes Guide

Update [SCOPES-GUIDE.md](SCOPES-GUIDE.md) with new scopes.

## Testing Scopes

### 1. Create Test User
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

### 2. Login and Get JWT
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
# Save access_token
```

### 3. Create API Key with Limited Scopes
```bash
curl -X POST http://localhost:8080/auth/api-key \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Read-Only Key",
    "scopes": ["forms:read", "va-knowledge:search"]
  }'
# Save apiKey
```

### 4. Test with API Key - Should Work (has forms:read)
```bash
curl http://localhost:8080/api/forms \
  -H "x-api-key: <api-key>"
```

### 5. Test with API Key - Should Fail (missing forms:write)
```bash
curl -X POST http://localhost:8080/api/forms \
  -H "x-api-key: <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Form"}'

# Expected response:
# {
#   "statusCode": 403,
#   "message": "Insufficient permissions. Required scopes: forms:write OR forms:admin. Your scopes: forms:read, va-knowledge:search"
# }
```

### 6. Test with JWT - Should Work (bypasses scopes)
```bash
curl -X POST http://localhost:8080/api/forms \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Form"}'
# Works - JWT users have full access
```

## Advanced Patterns

### Path-Specific Scopes

You can create more specific patterns:

```typescript
{
  method: 'GET',
  pathPattern: /^\/api\/forms\/[^\/]+$/,  // Match /api/forms/123 but not /api/forms/123/schema
  scopes: ['forms:read:detail'],
},
{
  method: 'GET',
  pathPattern: /^\/api\/forms$/,  // Match /api/forms only
  scopes: ['forms:read:list'],
},
```

### Admin-Only Endpoints

```typescript
{
  method: ['GET', 'POST', 'PUT', 'DELETE'],
  pathPattern: /^\/api\/admin/,
  scopes: ['admin:*'],
  description: 'Admin operations - full access only',
},
```

### Service-to-Service Endpoints

Internal endpoints can be left without scope requirements:

```typescript
{
  method: 'POST',
  pathPattern: /^\/api\/internal/,
  scopes: [],  // No scopes required (but still needs auth)
  description: 'Internal service calls',
},
```

## Comparison: Decorators vs. Route Mapping

| Feature | Decorators | Route Mapping |
|---------|-----------|---------------|
| **Works with proxy routes** | ❌ No | ✅ Yes |
| **Dynamic Swagger merging** | ❌ No | ✅ Yes |
| **Centralized config** | ❌ No | ✅ Yes |
| **Type safety** | ✅ Yes | ⚠️ Partial |
| **Easy to update** | ❌ No (code changes) | ✅ Yes (config changes) |
| **Works with direct routes** | ✅ Yes | ✅ Yes (fallback) |

## Best Practices

### 1. Order Rules from Specific to General

```typescript
export const SCOPE_RULES: ScopeRule[] = [
  // More specific first
  {
    method: 'GET',
    pathPattern: /^\/api\/forms\/[^\/]+\/schema$/,
    scopes: ['forms:read:schema'],
  },
  // More general last
  {
    method: 'GET',
    pathPattern: /^\/api\/forms/,
    scopes: ['forms:read'],
  },
];
```

### 2. Use Descriptive Scope Names

✅ Good:
- `forms:read`
- `va-knowledge:search`
- `processor:upload`

❌ Bad:
- `read`
- `search`
- `upload`

### 3. Group by Service

```typescript
// Forms Service
{ ... },
{ ... },

// VA Knowledge Service
{ ... },
{ ... },

// Processor Service
{ ... },
{ ... },
```

### 4. Document Every Rule

```typescript
{
  method: 'GET',
  pathPattern: /^\/api\/forms/,
  scopes: ['forms:read'],
  description: 'Read forms', // Always include description
}
```

## Troubleshooting

### Scope Not Being Enforced

1. Check `ScopesGuard` is added to route:
   ```typescript
   @UseGuards(JwtOrApiKeyGuard, ScopesGuard, RateLimitGuard)
   ```

2. Verify rule exists in `SCOPE_RULES`

3. Test pattern matching:
   ```typescript
   console.log(/^\/api\/forms/.test('/api/forms/123')); // true
   ```

### Wrong Scope Required

Check rule order - more specific rules should come first.

### Wildcard Not Working

Wildcards are only supported in the `required` scopes, not `user` scopes:

```typescript
// This works
requiredScopes: ['admin:*']
userScopes: ['admin:users']
✅ Match

// This doesn't work
requiredScopes: ['admin:users']
userScopes: ['admin:*']
❌ No match
```

---

**Last Updated:** 2025-10-20
