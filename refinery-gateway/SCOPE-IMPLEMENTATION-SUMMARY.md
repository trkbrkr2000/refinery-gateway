# Scope Implementation Summary

## Problem Identified

**Question:** "How do scopes work in the gateway if we are dynamically defining them by merging the swagger docs?"

**Answer:** They didn't work properly! The original implementation had a fundamental flaw:

### Original Approach (Broken)
- Used `@RequireScopes()` decorators on gateway proxy routes
- But gateway only has generic routes like `/api/forms/*`
- No way to know if request is `GET /api/forms` vs `POST /api/forms/123/schema`
- Swagger docs are merged dynamically, but scopes weren't extracted from them

### Example of the Problem

```typescript
// This doesn't work because it can't distinguish between endpoints
@All('api/forms/*')
@RequireScopes('forms:read')  // ❌ Too broad - what about POST?
async proxyForms() { ... }
```

## Solution Implemented

### Route-Based Scope Mapping

Instead of decorators, we now use a **configuration file** that maps HTTP methods and URL patterns to required scopes.

## Files Changed/Created

### 1. Created: `src/auth/scope-mapping.ts`
**Purpose:** Centralized scope configuration

**Key Features:**
- Define scope rules with HTTP method + URL pattern
- `findRequiredScopes()` - matches request to scopes
- `hasRequiredScopes()` - validates user has required scopes
- Support for wildcard scopes (e.g., `admin:*`)

**Example:**
```typescript
export const SCOPE_RULES: ScopeRule[] = [
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
];
```

### 2. Modified: `src/auth/guards/scopes.guard.ts`
**Changes:**
- Imported `findRequiredScopes` and `hasRequiredScopes`
- Added fallback logic: try decorator first, then route mapping
- Improved error messages to show user's scopes

**Flow:**
1. Check if JWT (bypass scopes) ✅
2. Check for `@RequireScopes()` decorator
3. If no decorator, use route mapping
4. Validate user has required scopes

### 3. Modified: `src/gateway/gateway.controller.ts`
**Changes:**
- Added `ScopesGuard` import
- Applied `ScopesGuard` to all proxy routes

**Before:**
```typescript
@All('api/forms/*')
@UseGuards(JwtOrApiKeyGuard, RateLimitGuard)
```

**After:**
```typescript
@All('api/forms/*')
@UseGuards(JwtOrApiKeyGuard, ScopesGuard, RateLimitGuard)
```

### 4. Created: `DYNAMIC-SCOPES-GUIDE.md`
**Purpose:** Complete documentation of the new scope system

**Contents:**
- Problem explanation
- Solution overview
- How it works (flow diagrams)
- Adding new scopes
- Testing instructions
- Advanced patterns
- Best practices
- Troubleshooting

## How It Works: Complete Flow

### Example: `GET /api/forms/123` with API Key

```
1. Request arrives at gateway
   ↓
2. JwtOrApiKeyGuard
   - Validates API key
   - Sets request.user = {
       userId: '...',
       scopes: ['forms:read', 'va-knowledge:search'],
       authMethod: 'api-key',
     }
   ↓
3. ScopesGuard
   - Sees authMethod === 'api-key'
   - No @RequireScopes() decorator found
   - Calls findRequiredScopes('GET', '/api/forms/123')
   - Matches rule: { method: 'GET', pathPattern: /^\/api\/forms/, scopes: ['forms:read'] }
   - Calls hasRequiredScopes(['forms:read', 'va-knowledge:search'], ['forms:read'])
   - ✅ User has 'forms:read' scope
   ↓
4. RateLimitGuard
   - Checks rate limit
   ↓
5. Proxy to backend service
   - Request forwarded to refinery-api
```

### Example: `POST /api/forms` with API Key (Missing Scope)

```
1. Request arrives
   ↓
2. JwtOrApiKeyGuard
   - Sets request.user = {
       scopes: ['forms:read'],  // Missing 'forms:write'
       authMethod: 'api-key',
     }
   ↓
3. ScopesGuard
   - Finds required scopes: ['forms:write', 'forms:admin']
   - User has: ['forms:read']
   - ❌ No match
   - Throws ForbiddenException:
     "Insufficient permissions. Required scopes: forms:write OR forms:admin. Your scopes: forms:read"
   ↓
4. 403 Forbidden returned to client
```

### Example: `POST /api/forms` with JWT

```
1. Request arrives
   ↓
2. JwtOrApiKeyGuard
   - Validates JWT
   - Sets request.user = {
       userId: '...',
       email: '...',
       authMethod: 'jwt',
     }
   ↓
3. ScopesGuard
   - Sees authMethod === 'jwt'
   - ✅ Bypass scope checks (JWT users have full access)
   ↓
4. RateLimitGuard
   ↓
5. Proxy to backend
```

## Current Scope Rules

### Forms Service
| Method | Pattern | Scopes | Description |
|--------|---------|--------|-------------|
| GET | `/api/forms` | `forms:read` | Read forms |
| POST/PUT/PATCH | `/api/forms` | `forms:write`, `forms:admin` | Create/update forms |
| DELETE | `/api/forms` | `forms:delete`, `forms:admin` | Delete forms |

### VA Knowledge Service
| Method | Pattern | Scopes | Description |
|--------|---------|--------|-------------|
| GET | `/api/va-knowledge/search` | `va-knowledge:search` | Search VA knowledge |
| GET | `/api/va-knowledge` | `va-knowledge:read` | Read VA knowledge |
| POST | `/api/va-knowledge/analyze` | `va-knowledge:analyze`, `va-knowledge:admin` | Analyze VA content |

### Document Processor
| Method | Pattern | Scopes | Description |
|--------|---------|--------|-------------|
| POST | `/api/processor/upload` | `processor:upload`, `processor:admin` | Upload documents |
| POST | `/api/processor/process` | `processor:process`, `processor:admin` | Process documents |
| GET | `/api/processor` | `processor:read` | Read processing results |

### Admin Endpoints
| Method | Pattern | Scopes | Description |
|--------|---------|--------|-------------|
| ALL | `/api/admin` | `admin:*` | Admin operations |

## Benefits of New Approach

### ✅ Works with Dynamic Routing
- Gateway doesn't need to know specific backend endpoints
- Scopes defined by HTTP method + URL pattern

### ✅ Centralized Configuration
- All scopes in one file (`scope-mapping.ts`)
- Easy to update without changing multiple files

### ✅ Backward Compatible
- Still supports `@RequireScopes()` decorators (for direct routes)
- Falls back to route mapping if no decorator found

### ✅ Clear Error Messages
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions. Required scopes: forms:write OR forms:admin. Your scopes: forms:read, va-knowledge:search"
}
```

### ✅ Flexible Patterns
- Regex patterns allow fine-grained control
- Support for wildcards (`admin:*`)
- OR logic for multiple scopes

## Testing the Implementation

### 1. Create User and Login
```bash
# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!", "name": "Test"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}'
```

### 2. Create API Key with Limited Scopes
```bash
curl -X POST http://localhost:8080/auth/api-key \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Read-Only", "scopes": ["forms:read"]}'
```

### 3. Test Read (Should Work)
```bash
curl http://localhost:8080/api/forms \
  -H "x-api-key: <api-key>"
```

### 4. Test Write (Should Fail - Missing Scope)
```bash
curl -X POST http://localhost:8080/api/forms \
  -H "x-api-key: <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
# Expected: 403 Forbidden
```

### 5. Test JWT (Should Work - Bypasses Scopes)
```bash
curl -X POST http://localhost:8080/api/forms \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
# Expected: 200/201 Success
```

## Adding New Services

### Step 1: Add Scope Rules
Edit `src/auth/scope-mapping.ts`:

```typescript
{
  method: 'GET',
  pathPattern: /^\/api\/my-service/,
  scopes: ['my-service:read'],
  description: 'Read my service',
},
```

### Step 2: Add Proxy Route
Edit `src/gateway/gateway.controller.ts`:

```typescript
@All('api/my-service/*')
@UseGuards(JwtOrApiKeyGuard, ScopesGuard, RateLimitGuard)
async proxyMyService(@Req() req: Request, @Res() res: Response) {
  return this.proxyRequest(req, res, 'MY_SERVICE_URL');
}
```

### Step 3: Update Environment
Add to `.env`:
```
MY_SERVICE_URL=http://localhost:3002
```

Done! Scopes are automatically enforced.

## Next Steps

### Immediate
- [ ] Test scope enforcement with actual API keys
- [ ] Verify all services have correct scope rules
- [ ] Test error messages are clear

### Future Enhancements
- [ ] Auto-generate scope rules from Swagger docs
- [ ] Add scope usage analytics
- [ ] Support for user-specific scopes (`forms:read:own`)
- [ ] Scope inheritance (e.g., `forms:admin` includes `forms:read`)

## Related Documentation

- [DYNAMIC-SCOPES-GUIDE.md](DYNAMIC-SCOPES-GUIDE.md) - Complete implementation guide
- [SCOPES-GUIDE.md](SCOPES-GUIDE.md) - Original scope documentation
- [SECURITY-FLOW.md](SECURITY-FLOW.md) - Authentication flow
- [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md) - Gateway feature status

---

**Last Updated:** 2025-10-20
**Status:** ✅ Implemented and Ready for Testing
