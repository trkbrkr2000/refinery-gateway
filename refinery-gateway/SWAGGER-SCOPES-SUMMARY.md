# Swagger-Based Scopes Implementation Summary

## Question

> "is there a way to map it in the swagger?"

## Answer

**Yes! And it's much better than hardcoded scope mapping.**

Backend services can now define scope requirements directly in their Swagger/OpenAPI documentation using the custom extension `x-required-scopes`. The gateway automatically extracts and enforces these scopes.

## What Was Implemented

### 1. SwaggerScopeExtractorService

**File:** [src/auth/swagger-scope-extractor.service.ts](src/auth/swagger-scope-extractor.service.ts)

- Extracts `x-required-scopes` from Swagger paths
- Builds in-memory scope mapping (method + path → scopes)
- Supports parameterized routes (`/api/forms/{id}`)
- Supports wildcard scopes (`admin:*`)

### 2. Updated SwaggerMergerService

**File:** [src/gateway/swagger-merger.service.ts](src/gateway/swagger-merger.service.ts)

**Changes:**
- Injected `SwaggerScopeExtractorService`
- Calls `scopeExtractor.updateScopeMappings(merged)` after merging
- Automatically builds scope map on startup

### 3. Updated ScopesGuard

**File:** [src/auth/guards/scopes.guard.ts](src/auth/guards/scopes.guard.ts)

**New Priority Order:**
1. **Decorator-based** (`@RequireScopes()`) - for direct routes
2. **Swagger-based** (`x-required-scopes`) - **NEW!** Automatic from Swagger docs
3. **Hardcoded mapping** (`scope-mapping.ts`) - fallback for legacy

### 4. Updated AuthModule

**File:** [src/auth/auth.module.ts](src/auth/auth.module.ts)

- Added `SwaggerScopeExtractorService` to providers
- Exported for use in other modules

## How It Works

```
┌─────────────────────────────────────────────┐
│  Backend Service (refinery-api)             │
│                                             │
│  @Get('/api/v1/forms')                      │
│  @ApiExtension('x-required-scopes',         │
│                 ['forms:read'])             │
│  async findAll() { ... }                    │
└──────────────────┬──────────────────────────┘
                   │
                   │ GET /api-json
                   ▼
┌─────────────────────────────────────────────┐
│  Gateway - SwaggerMergerService             │
│                                             │
│  1. Fetch /api-json from each service       │
│  2. Merge into unified Swagger doc          │
│  3. Extract x-required-scopes              │
│  4. Build scope mapping:                    │
│     GET /api/forms/api/v1/forms             │
│       → ['forms:read']                      │
└──────────────────┬──────────────────────────┘
                   │
                   │ Scope map cached in memory
                   ▼
┌─────────────────────────────────────────────┐
│  Request: GET /api/forms/api/v1/forms       │
│  Header: x-api-key: rfy_abc123...           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  JwtOrApiKeyGuard                           │
│  - Validates API key                        │
│  - Sets user.scopes = ['forms:read']        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  ScopesGuard                                │
│  1. Check for @RequireScopes() ❌ None      │
│  2. Check Swagger scopes ✅ Found           │
│     ['forms:read']                          │
│  3. Check user has scopes ✅ Match          │
│  → Allow request                            │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Proxy to Backend Service                   │
│  ✅ Request succeeds                        │
└─────────────────────────────────────────────┘
```

## Backend Usage (NestJS)

### Simple Example

```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { ApiExtension, ApiTags } from '@nestjs/swagger';

@ApiTags('forms')
@Controller('api/v1/forms')
export class FormsController {

  @Get()
  @ApiExtension('x-required-scopes', ['forms:read'])
  async findAll() {
    return { forms: [] };
  }

  @Post()
  @ApiExtension('x-required-scopes', ['forms:write', 'forms:admin'])
  async create() {
    return { id: '123' };
  }
}
```

### With Scope Constants

```typescript
export const FormScopes = {
  READ: 'forms:read',
  WRITE: 'forms:write',
  DELETE: 'forms:delete',
  ADMIN: 'forms:admin',
} as const;

@Get()
@ApiExtension('x-required-scopes', [FormScopes.READ])
async findAll() { ... }
```

### Custom Decorator (Optional)

```typescript
// src/common/decorators/require-scopes.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiExtension } from '@nestjs/swagger';

export function RequireScopes(...scopes: string[]) {
  return applyDecorators(ApiExtension('x-required-scopes', scopes));
}

// Usage
@Get()
@RequireScopes(FormScopes.READ)
async findAll() { ... }
```

## Benefits

| Feature | Hardcoded Mapping | Swagger-Based |
|---------|-------------------|---------------|
| **Single source of truth** | ❌ No (duplicated config) | ✅ Yes (defined in backend) |
| **Automatic updates** | ❌ No (manual gateway changes) | ✅ Yes (picked up on restart) |
| **Type safety** | ⚠️ Partial | ✅ Yes (with const enums) |
| **Self-documenting** | ❌ No | ✅ Yes (visible in Swagger UI) |
| **Per-endpoint control** | ⚠️ Via regex patterns | ✅ Yes (exact endpoint) |
| **Easy to maintain** | ❌ No (scattered config) | ✅ Yes (co-located with code) |

## Verification

### Check Backend Swagger

```bash
curl http://localhost:3001/api-json | \
  jq '.paths."/api/v1/forms".get."x-required-scopes"'

# Expected:
# ["forms:read"]
```

### Check Gateway Merged Swagger

```bash
curl http://localhost:8080/api-docs-json | \
  jq '.paths."/api/forms/api/v1/forms".get."x-required-scopes"'

# Expected:
# ["forms:read"]
```

### Check Gateway Logs

```
✅ Merged Forms API (12 endpoints)
✅ Extracted 42 scope mappings from Swagger docs
```

## Testing

### 1. Create API Key

```bash
curl -X POST http://localhost:8080/auth/api-key \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Key",
    "scopes": ["forms:read"]
  }'
```

### 2. Test Read (Should Work)

```bash
curl http://localhost:8080/api/forms/api/v1/forms \
  -H "x-api-key: rfy_abc123..."

# Expected: 200 OK
```

### 3. Test Write (Should Fail)

```bash
curl -X POST http://localhost:8080/api/forms/api/v1/forms \
  -H "x-api-key: rfy_abc123..." \
  -d '{}'

# Expected: 403 Forbidden
# {
#   "statusCode": 403,
#   "message": "Insufficient permissions. Required scopes: forms:write OR forms:admin. Your scopes: forms:read"
# }
```

## Migration Path

### Phase 1: Add Swagger Scopes (Non-Breaking)

Add `x-required-scopes` to backend controllers while keeping hardcoded mapping:

```typescript
@Get()
@ApiExtension('x-required-scopes', ['forms:read'])
async findAll() { ... }
```

Gateway will use Swagger scopes first, fall back to hardcoded if missing.

### Phase 2: Verify All Endpoints

Test that all endpoints have correct scopes in Swagger.

### Phase 3: Remove Hardcoded Mapping

Once all services define scopes in Swagger, remove [scope-mapping.ts](src/auth/scope-mapping.ts).

## Related Documentation

- **[SWAGGER-SCOPES-GUIDE.md](SWAGGER-SCOPES-GUIDE.md)** - Complete implementation guide for backend developers
- **[DYNAMIC-SCOPES-GUIDE.md](DYNAMIC-SCOPES-GUIDE.md)** - Route-based mapping (alternative approach)
- **[SCOPES-GUIDE.md](SCOPES-GUIDE.md)** - Original scope documentation
- **[SECURITY-FLOW.md](SECURITY-FLOW.md)** - Complete authentication flow

## Files Changed

### Created
- `src/auth/swagger-scope-extractor.service.ts` - Scope extraction logic
- `SWAGGER-SCOPES-GUIDE.md` - Backend developer guide
- `SWAGGER-SCOPES-SUMMARY.md` - This file

### Modified
- `src/gateway/swagger-merger.service.ts` - Extract scopes during merge
- `src/auth/guards/scopes.guard.ts` - Use Swagger scopes
- `src/auth/auth.module.ts` - Register new service

## Next Steps

### Immediate
1. Add `x-required-scopes` to refinery-api controllers
2. Restart gateway to pick up scopes
3. Test scope enforcement

### Backend Team
1. Read [SWAGGER-SCOPES-GUIDE.md](SWAGGER-SCOPES-GUIDE.md)
2. Add scopes to all endpoints
3. Create scope constants file

### Future
1. Auto-generate scope constants from Swagger
2. Add scope validation at compile time
3. Create scope management UI in admin dashboard

---

**Status:** ✅ Implemented and Ready for Testing
**Last Updated:** 2025-10-20
