# Remove Authentication from Backend Services

## Why?

Once requests pass through the **API Gateway**, backend services are in a **trusted network** and should not re-authenticate.

### Architecture Pattern

```
User → Gateway (Auth ✓) → Backend Services (No Auth)
       ↑
    Security Boundary
```

**Benefits:**
- Simpler backend code
- Better performance (no duplicate auth checks)
- Single source of truth for authentication
- Easier to update auth logic (one place)

## What to Remove

### From All Business Logic Controllers:

1. **Remove** `@UseGuards(ApiKeyGuard)` decorator
2. **Remove** `@UseGuards(JwtAuthGuard)` decorator
3. **Remove** `@RequireScopes()` decorator
4. **Remove** `@ApiSecurity('api-key')` decorator
5. **Keep** public routes (health checks, etc.)

### Keep Auth in These Controllers:

- `auth.controller.ts` - Needs to manage JWT/API keys
- `tokens.controller.ts` - Needs to validate tokens

## Files to Modify

### refinery-api/src/

1. ✅ **components/components.controller.ts**
   - Remove: `@UseGuards(ApiKeyGuard)`
   - Remove: All `@RequireScopes()` decorators
   - Remove: `@ApiSecurity('api-key')`

2. ✅ **pipelines/pipelines.controller.ts**
   - Remove: `@UseGuards(ApiKeyGuard)`
   - Remove: All `@RequireScopes()` decorators
   - Remove: `@ApiSecurity('api-key')`

3. ✅ **jobs/jobs.controller.ts**
   - Remove: `@UseGuards(ApiKeyGuard)`
   - Remove: All `@RequireScopes()` decorators
   - Remove: `@ApiSecurity('api-key')`

4. ✅ **execution-logs/execution-logs.controller.ts**
   - Remove: `@UseGuards(ApiKeyGuard)`
   - Remove: All `@RequireScopes()` decorators
   - Remove: `@ApiSecurity('api-key')`

5. ✅ **data-sources/data-sources.controller.ts**
   - Remove: `@UseGuards(ApiKeyGuard)`
   - Remove: All `@RequireScopes()` decorators
   - Remove: `@ApiSecurity('api-key')`

6. ✅ **forms/forms.controller.ts**
   - Remove auth guards (if any)

7. ✅ **va-knowledge/va-knowledge.controller.ts**
   - Remove auth guards (if any)

8. ✅ **storage/storage.controller.ts**
   - Remove auth guards (if any)

9. ✅ **documents/documents.controller.ts**
   - Remove auth guards (if any)

10. ✅ **queues/queues.controller.ts**
    - Already internal-only, keep as is

## Example Changes

### Before (❌ Backend doing auth):
```typescript
@ApiTags('components')
@ApiSecurity('api-key')  // ❌ Remove
@Controller('api/v1/components')
@UseGuards(ApiKeyGuard)  // ❌ Remove
export class ComponentsController {

  @Get()
  @RequireScopes(ApiScopes.READ_COMPONENTS)  // ❌ Remove
  async findAll() {
    return this.componentsService.findAll();
  }
}
```

### After (✅ Gateway handles auth):
```typescript
@ApiTags('components')
@Controller('api/v1/components')
export class ComponentsController {

  @Get()
  async findAll() {
    return this.componentsService.findAll();
  }
}
```

## Implementation Steps

### 1. Remove Controller-Level Guards

For each controller, remove:
```typescript
// Remove these lines
@UseGuards(ApiKeyGuard)
@ApiSecurity('api-key')
```

### 2. Remove Method-Level Decorators

For each endpoint method, remove:
```typescript
// Remove these lines
@RequireScopes(ApiScopes.READ_COMPONENTS)
@RequireScopes(ApiScopes.WRITE_COMPONENTS)
// etc.
```

### 3. Remove Unused Imports

After removing guards, clean up:
```typescript
// Remove if no longer used
import { UseGuards } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { RequireScopes } from '../auth/decorators/scopes.decorator';
import { ApiScopes } from '../common/enums';
```

### 4. Update Swagger Docs

The unified Swagger at the gateway will still show security requirements because the gateway adds them during merging.

## Testing After Changes

### 1. Direct Backend Call (Should work without auth)
```bash
# This should now work WITHOUT api key
curl http://localhost:3001/api/v1/components
```

### 2. Through Gateway (Requires auth)
```bash
# This REQUIRES auth at gateway
curl http://localhost:8080/api/components \
  -H "Authorization: Bearer <jwt>" \
  # OR
  -H "x-api-key: <api-key>"
```

## Security Considerations

### ✅ Safe if:
- Gateway is the ONLY public entry point
- Backend services are on private network
- No direct external access to backend ports

### ⚠️ Risk if:
- Backend services exposed to public internet
- Direct access to ports 3001, 8000, etc. allowed

### Mitigation:
**In Production:**
- Use Railway private networking
- Backend services on `http://refinery-api.railway.internal:3001`
- Only gateway exposed publicly
- Firewall rules block direct backend access

**In Development:**
- Keep backend on localhost
- Only gateway on 0.0.0.0

## Future: Request Context Forwarding

Optionally, gateway can forward user context to backend:

```typescript
// Gateway adds headers:
headers: {
  'x-user-id': user.userId,
  'x-user-email': user.email,
  'x-user-roles': JSON.stringify(user.roles),
}
```

Backend can read these headers (trusted since from gateway):
```typescript
// In controller:
const userId = req.headers['x-user-id'];
// Use for logging, auditing, etc.
```

## Rollout Plan

1. ✅ Test current setup (auth in both gateway + backend)
2. ✅ Remove auth from ONE backend controller
3. ✅ Test that controller (direct + through gateway)
4. ✅ If working, remove from all controllers
5. ✅ Update deployment docs
6. ✅ Configure production networking

---

**Status:** Ready to implement
**Impact:** Simplified backend, better performance
**Risk:** Low (gateway handles all auth)
