# Swagger-Based Scopes - Complete Guide

## Overview

Instead of manually maintaining scope rules in the gateway, backend services can define their scope requirements directly in **Swagger/OpenAPI documentation** using the custom extension `x-required-scopes`.

The gateway automatically extracts these scopes when merging Swagger docs and enforces them for API key authentication.

## How It Works

```
Backend Service (NestJS)
  ↓
Defines scopes in Swagger using @ApiExtension()
  ↓
Gateway fetches /api-json from backend
  ↓
SwaggerMergerService merges all backend Swagger docs
  ↓
SwaggerScopeExtractorService extracts x-required-scopes
  ↓
ScopesGuard enforces scopes on incoming requests
```

## Benefits

✅ **Single Source of Truth** - Scopes defined once in backend code
✅ **Automatic Updates** - Gateway picks up changes without redeployment
✅ **No Duplicate Config** - Don't maintain scope rules in two places
✅ **Type Safety** - Scopes validated at compile time (if using const enum)
✅ **Self-Documenting** - Scopes visible in Swagger UI

## Backend Implementation (NestJS)

### Step 1: Define Your Scopes

Create a constants file for your scopes:

**File:** `src/common/constants/scopes.ts`

```typescript
export const FormScopes = {
  READ: 'forms:read',
  WRITE: 'forms:write',
  DELETE: 'forms:delete',
  ADMIN: 'forms:admin',
} as const;
```

### Step 2: Add Scopes to Controller

Use the `@ApiExtension()` decorator from `@nestjs/swagger`:

**File:** `src/forms/forms.controller.ts`

```typescript
import { Controller, Get, Post, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiExtension, ApiOperation } from '@nestjs/swagger';
import { FormScopes } from '../common/constants/scopes';

@ApiTags('forms')
@Controller('api/v1/forms')
export class FormsController {

  // GET /api/forms - requires forms:read scope
  @Get()
  @ApiOperation({ summary: 'List all forms' })
  @ApiExtension('x-required-scopes', [FormScopes.READ])
  async findAll() {
    // ...
  }

  // POST /api/forms - requires forms:write OR forms:admin
  @Post()
  @ApiOperation({ summary: 'Create a new form' })
  @ApiExtension('x-required-scopes', [FormScopes.WRITE, FormScopes.ADMIN])
  async create() {
    // ...
  }

  // PUT /api/forms/:id - requires forms:write OR forms:admin
  @Put(':id')
  @ApiOperation({ summary: 'Update a form' })
  @ApiExtension('x-required-scopes', [FormScopes.WRITE, FormScopes.ADMIN])
  async update() {
    // ...
  }

  // DELETE /api/forms/:id - requires forms:delete OR forms:admin
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a form' })
  @ApiExtension('x-required-scopes', [FormScopes.DELETE, FormScopes.ADMIN])
  async delete() {
    // ...
  }
}
```

### Step 3: Verify Swagger Output

Start your backend service and check the Swagger JSON:

```bash
curl http://localhost:3001/api-json | jq '.paths."/api/v1/forms".get'
```

You should see:

```json
{
  "summary": "List all forms",
  "operationId": "findAll",
  "x-required-scopes": ["forms:read"],
  "responses": {
    "200": { "description": "Success" }
  }
}
```

### Step 4: (Optional) Create Helper Decorator

For cleaner syntax, create a custom decorator:

**File:** `src/common/decorators/require-scopes.decorator.ts`

```typescript
import { applyDecorators } from '@nestjs/common';
import { ApiExtension } from '@nestjs/swagger';

export function RequireScopes(...scopes: string[]) {
  return applyDecorators(
    ApiExtension('x-required-scopes', scopes),
  );
}
```

Now you can use it like this:

```typescript
import { RequireScopes } from '../common/decorators/require-scopes.decorator';
import { FormScopes } from '../common/constants/scopes';

@Get()
@RequireScopes(FormScopes.READ)
async findAll() {
  // ...
}
```

## FastAPI Implementation

For Python/FastAPI backends:

```python
from fastapi import APIRouter
from typing import List

router = APIRouter()

@router.get(
    "/api/v1/forms",
    summary="List all forms",
    openapi_extra={
        "x-required-scopes": ["forms:read"]
    }
)
async def get_forms():
    # ...
    pass

@router.post(
    "/api/v1/forms",
    summary="Create a form",
    openapi_extra={
        "x-required-scopes": ["forms:write", "forms:admin"]
    }
)
async def create_form():
    # ...
    pass
```

## Scope Naming Conventions

Follow this pattern for consistency:

```
{service}:{action}
```

### Good Examples

- `forms:read` - Read forms
- `forms:write` - Create/update forms
- `forms:delete` - Delete forms
- `forms:admin` - Full forms access
- `va-knowledge:search` - Search VA knowledge base
- `processor:upload` - Upload documents

### Bad Examples

- ❌ `read` - Too generic
- ❌ `forms` - Missing action
- ❌ `forms_read` - Wrong separator (use `:`)
- ❌ `FORMS:READ` - Don't use uppercase

## Multiple Scopes (OR Logic)

When you specify multiple scopes, the user needs **ANY ONE** of them (OR logic):

```typescript
@Post()
@ApiExtension('x-required-scopes', [FormScopes.WRITE, FormScopes.ADMIN])
async create() {
  // User needs EITHER forms:write OR forms:admin
}
```

To require **ALL** scopes (AND logic), create a combined scope:

```typescript
export const FormScopes = {
  WRITE_AND_DELETE: 'forms:write+delete', // Custom combined scope
};
```

## Wildcard Scopes

The gateway supports wildcard scopes:

```typescript
// User has this scope
scopes: ['forms:*']

// Can access these endpoints
'forms:read'   ✅
'forms:write'  ✅
'forms:delete' ✅
'forms:admin'  ✅

// But NOT these
'va-knowledge:read'  ❌
```

Admin wildcard:

```typescript
// User has this scope
scopes: ['admin:*']

// Can access these
'admin:users'     ✅
'admin:keys'      ✅
'admin:analytics' ✅
```

## Testing

### 1. Check Swagger Output

```bash
# Get your service's Swagger doc
curl http://localhost:3001/api-json > service-swagger.json

# Check for x-required-scopes
cat service-swagger.json | jq '.paths."/api/v1/forms".get."x-required-scopes"'
```

Expected:
```json
["forms:read"]
```

### 2. Check Gateway Merged Swagger

```bash
# Get gateway's merged Swagger doc
curl http://localhost:8080/api-docs-json > gateway-swagger.json

# Check merged routes
cat gateway-swagger.json | jq '.paths."/api/forms/api/v1/forms".get."x-required-scopes"'
```

Expected:
```json
["forms:read"]
```

### 3. Create API Key with Scope

```bash
# Login first
LOGIN_RESPONSE=$(curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}')

JWT=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

# Create API key with forms:read scope
API_KEY_RESPONSE=$(curl -X POST http://localhost:8080/auth/api-key \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Key",
    "scopes": ["forms:read"]
  }')

API_KEY=$(echo $API_KEY_RESPONSE | jq -r '.apiKey')
```

### 4. Test Scope Enforcement

```bash
# Should work (has forms:read scope)
curl http://localhost:8080/api/forms/api/v1/forms \
  -H "x-api-key: $API_KEY"

# Expected: 200 OK with data
```

```bash
# Should fail (missing forms:write scope)
curl -X POST http://localhost:8080/api/forms/api/v1/forms \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Form"}'

# Expected: 403 Forbidden
# {
#   "statusCode": 403,
#   "message": "Insufficient permissions. Required scopes: forms:write OR forms:admin. Your scopes: forms:read"
# }
```

## Fallback to Hardcoded Mapping

If a backend service doesn't define `x-required-scopes`, the gateway falls back to hardcoded scope mapping in [scope-mapping.ts](src/auth/scope-mapping.ts).

**Priority:**
1. `@RequireScopes()` decorator (highest) - for direct routes
2. `x-required-scopes` from Swagger (automatic) - for proxied routes
3. Hardcoded `scope-mapping.ts` (fallback) - for legacy endpoints

## Migration Guide

### Before (Hardcoded Gateway Config)

**refinery-gateway/src/auth/scope-mapping.ts**
```typescript
export const SCOPE_RULES: ScopeRule[] = [
  {
    method: 'GET',
    pathPattern: /^\/api\/forms/,
    scopes: ['forms:read'],
  },
  // ...dozens more rules...
];
```

### After (Swagger-Based)

**refinery-api/src/forms/forms.controller.ts**
```typescript
@Get()
@ApiExtension('x-required-scopes', ['forms:read'])
async findAll() {
  // ...
}
```

Gateway automatically picks this up! 🎉

## Troubleshooting

### Scopes Not Being Enforced

**Check 1:** Verify `x-required-scopes` in Swagger JSON
```bash
curl http://localhost:3001/api-json | jq '.paths."/api/v1/forms".get."x-required-scopes"'
```

**Check 2:** Verify gateway extracted scopes
```bash
# Add debug endpoint to gateway (admin only)
@Get('/admin/scopes')
@UseGuards(JwtAuthGuard)
async getScopes() {
  return this.scopeExtractor.getAllScopeMappings();
}
```

**Check 3:** Check gateway logs
```
✅ Extracted 42 scope mappings from Swagger docs
```

### Scopes Extracted But Not Enforced

Check guard order - `ScopesGuard` must come AFTER `JwtOrApiKeyGuard`:

```typescript
@All('api/forms/*')
@UseGuards(JwtOrApiKeyGuard, ScopesGuard, RateLimitGuard) // ✅ Correct order
async proxyForms() { ... }
```

### Wrong Path in Scope Mapping

The gateway prefixes backend paths. If your backend has:

```
/api/v1/forms
```

The merged path will be:

```
/api/forms/api/v1/forms
```

This is intentional - the prefix (`/api/forms`) routes to your service.

## Best Practices

### 1. Define Scopes in Constants

```typescript
// ✅ Good
export const FormScopes = {
  READ: 'forms:read',
  WRITE: 'forms:write',
} as const;

@ApiExtension('x-required-scopes', [FormScopes.READ])

// ❌ Bad (magic strings)
@ApiExtension('x-required-scopes', ['forms:read'])
```

### 2. Group Related Scopes

```typescript
export const Scopes = {
  Forms: {
    READ: 'forms:read',
    WRITE: 'forms:write',
    DELETE: 'forms:delete',
    ADMIN: 'forms:admin',
  },
  VAKnowledge: {
    SEARCH: 'va-knowledge:search',
    READ: 'va-knowledge:read',
    ANALYZE: 'va-knowledge:analyze',
  },
};
```

### 3. Document Your Scopes

Create a `SCOPES.md` in your backend service:

```markdown
# Forms Service Scopes

- `forms:read` - View forms
- `forms:write` - Create/update forms
- `forms:delete` - Delete forms
- `forms:admin` - Full access (bypass all checks)
```

### 4. Use Descriptive Operation Summaries

```typescript
@Get()
@ApiOperation({ summary: 'List all forms (requires forms:read)' })
@ApiExtension('x-required-scopes', [FormScopes.READ])
async findAll() { ... }
```

## Advanced Patterns

### Controller-Level Scopes

Apply to all routes in a controller:

```typescript
@Controller('api/v1/forms')
@ApiExtension('x-required-scopes', [FormScopes.READ])
export class FormsController {

  @Get()
  async findAll() {
    // Inherits forms:read requirement
  }

  @Get(':id')
  async findOne() {
    // Inherits forms:read requirement
  }

  // Override for specific endpoint
  @Post()
  @ApiExtension('x-required-scopes', [FormScopes.WRITE])
  async create() {
    // Requires forms:write instead
  }
}
```

### Resource-Specific Scopes

```typescript
@Get('/own')
@ApiExtension('x-required-scopes', ['forms:read:own'])
async findOwn(@User() user) {
  // Can only read their own forms
}

@Get('/')
@ApiExtension('x-required-scopes', ['forms:read:all', 'forms:admin'])
async findAll() {
  // Can read all forms (needs higher privilege)
}
```

## Complete Example

**refinery-api/src/forms/forms.controller.ts**

```typescript
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiExtension, ApiOperation, ApiParam } from '@nestjs/swagger';

// Define scopes
export const FormScopes = {
  READ: 'forms:read',
  WRITE: 'forms:write',
  DELETE: 'forms:delete',
  ADMIN: 'forms:admin',
} as const;

@ApiTags('forms')
@Controller('api/v1/forms')
export class FormsController {

  @Get()
  @ApiOperation({ summary: 'List all forms' })
  @ApiExtension('x-required-scopes', [FormScopes.READ])
  async findAll() {
    return { forms: [] };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get form by ID' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiExtension('x-required-scopes', [FormScopes.READ])
  async findOne(@Param('id') id: string) {
    return { id, name: 'VA-21-526EZ' };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new form' })
  @ApiExtension('x-required-scopes', [FormScopes.WRITE, FormScopes.ADMIN])
  async create(@Body() dto: any) {
    return { id: '123', ...dto };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a form' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiExtension('x-required-scopes', [FormScopes.WRITE, FormScopes.ADMIN])
  async update(@Param('id') id: string, @Body() dto: any) {
    return { id, ...dto };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a form' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiExtension('x-required-scopes', [FormScopes.DELETE, FormScopes.ADMIN])
  async remove(@Param('id') id: string) {
    return { deleted: true };
  }
}
```

**Gateway automatically enforces these scopes - no additional config needed!**

---

**Last Updated:** 2025-10-20
**Status:** ✅ Implemented and Ready
