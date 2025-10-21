# API Scopes Guide

## Overview

API scopes control what operations an API key can perform. This allows fine-grained access control for different integrations and use cases.

## Scope Format

Scopes follow the pattern: `{resource}:{action}`

**Examples:**
- `forms:read` - Read form data
- `forms:write` - Create/update forms
- `va-knowledge:search` - Search VA knowledge base
- `documents:process` - Process documents

## Standard Scopes

### Forms Service
- `forms:read` - List and view forms
- `forms:write` - Create and update forms
- `forms:delete` - Delete forms
- `forms:admin` - Full forms access

### VA Knowledge Service
- `va-knowledge:search` - Search VA regulations
- `va-knowledge:read` - Read VA documents
- `va-knowledge:analyze` - Use analysis tools
- `va-knowledge:admin` - Full VA knowledge access

### Document Processor
- `processor:upload` - Upload documents
- `processor:process` - Process documents
- `processor:read` - Read processing results
- `processor:admin` - Full processor access

### Admin Scopes
- `admin:users` - Manage users
- `admin:keys` - Manage API keys
- `admin:analytics` - View analytics
- `admin:*` - Full admin access

## Using Scopes

### 1. Create API Key with Scopes

```bash
curl -X POST http://localhost:8080/auth/api-key \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Read-Only Integration",
    "scopes": ["forms:read", "va-knowledge:search"]
  }'
```

### 2. Protect Endpoints with Scopes

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtOrApiKeyGuard } from './auth/guards/jwt-or-api-key.guard';
import { ScopesGuard } from './auth/guards/scopes.guard';
import { RequireScopes } from './auth/decorators/require-scopes.decorator';

@Controller('forms')
@UseGuards(JwtOrApiKeyGuard, ScopesGuard)
export class FormsController {

  // Requires forms:read scope
  @Get()
  @RequireScopes('forms:read')
  async listForms() {
    // ...
  }

  // Requires forms:write scope
  @Post()
  @RequireScopes('forms:write')
  async createForm() {
    // ...
  }

  // Requires forms:delete OR forms:admin scope
  @Delete(':id')
  @RequireScopes('forms:delete', 'forms:admin')
  async deleteForm() {
    // ...
  }
}
```

### 3. Make Requests with API Key

```bash
# This will work (has forms:read scope)
curl http://localhost:8080/api/forms \
  -H "x-api-key: rfy_abc123..."

# This will fail with 403 Forbidden (missing forms:write scope)
curl -X POST http://localhost:8080/api/forms \
  -H "x-api-key: rfy_abc123..." \
  -H "Content-Type: application/json" \
  -d '{"name": "New Form"}'
```

## Scope Enforcement Rules

### JWT Authentication
✅ **JWT users bypass scope checks** - They have full access to all endpoints

### API Key Authentication
⚠️ **API keys MUST have required scopes** - Checked on every request

### Multiple Scopes
When multiple scopes are specified with `@RequireScopes()`, the logic is **OR**:
```typescript
@RequireScopes('forms:delete', 'forms:admin')
// API key needs EITHER forms:delete OR forms:admin
```

### No Scopes Required
If no `@RequireScopes()` decorator is present, the endpoint is accessible to all authenticated users (JWT or API key).

## Best Practices

### 1. Principle of Least Privilege
Create API keys with the minimum scopes needed:
```typescript
// ❌ Too broad
scopes: ['forms:admin', 'va-knowledge:admin', 'processor:admin']

// ✅ Minimal access
scopes: ['forms:read', 'va-knowledge:search']
```

### 2. Separate Keys for Different Integrations
```typescript
// Frontend app - read-only
scopes: ['forms:read', 'va-knowledge:search']

// Backend automation - write access
scopes: ['forms:write', 'processor:process']

// Admin dashboard - full access
scopes: ['admin:*']
```

### 3. Use Descriptive Names
```typescript
{
  name: "Production Frontend - Read Only",
  scopes: ['forms:read', 'va-knowledge:search']
}
```

### 4. Rotate Keys Regularly
- Create new key with same scopes
- Update applications
- Revoke old key

### 5. Monitor Scope Usage
Check analytics for unauthorized access attempts:
```bash
GET /admin/analytics/errors?limit=100
```

## Scope Wildcards (Future Feature)

In the future, we may support wildcard scopes:
```typescript
// All forms operations
scopes: ['forms:*']

// All read operations
scopes: ['*:read']

// Full access
scopes: ['*:*']
```

Currently, each scope must be explicitly listed.

## Error Responses

### Missing Authentication
```json
{
  "statusCode": 401,
  "message": "Authentication required. Provide either a valid JWT token or API key"
}
```

### Insufficient Scopes
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions. Required scopes: forms:write OR forms:admin. Your scopes: forms:read"
}
```

## Common Use Cases

### Read-Only API Key (for frontend)
```typescript
{
  name: "Website Frontend",
  scopes: [
    "forms:read",
    "va-knowledge:search",
    "va-knowledge:read"
  ]
}
```

### Full Access API Key (for backend automation)
```typescript
{
  name: "Backend Service",
  scopes: [
    "forms:read",
    "forms:write",
    "forms:delete",
    "processor:upload",
    "processor:process",
    "va-knowledge:search",
    "va-knowledge:analyze"
  ]
}
```

### Admin API Key (for admin dashboard)
```typescript
{
  name: "Admin Dashboard",
  scopes: [
    "admin:users",
    "admin:keys",
    "admin:analytics"
  ]
}
```

### Testing API Key (limited access)
```typescript
{
  name: "QA Environment",
  scopes: [
    "forms:read",
    "va-knowledge:search"
  ]
}
```

## Scope Naming Convention

Follow this pattern for consistency:

```
{service}:{action}:{resource?}

Examples:
- forms:read          (read all forms)
- forms:read:own      (read only your forms)
- forms:write         (create/update forms)
- forms:delete        (delete forms)
- forms:admin         (all forms operations)
```

## Implementation Checklist

When adding a new protected endpoint:

- [ ] Add `@UseGuards(JwtOrApiKeyGuard, ScopesGuard)` to controller
- [ ] Add `@RequireScopes('resource:action')` to method
- [ ] Document the scope in this guide
- [ ] Update Swagger docs with scope requirement
- [ ] Test with API key that has the scope
- [ ] Test with API key that lacks the scope (should get 403)
- [ ] Test with JWT (should bypass scope check)

## Testing Scopes

```bash
# 1. Create test user and login
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!", "name": "Test User"}'

curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}'
# Save JWT token

# 2. Create API key with limited scopes
curl -X POST http://localhost:8080/auth/api-key \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key", "scopes": ["forms:read"]}'
# Save API key

# 3. Test with API key - should work
curl http://localhost:8080/api/forms \
  -H "x-api-key: <api-key>"

# 4. Test with API key - should fail (no forms:write scope)
curl -X POST http://localhost:8080/api/forms \
  -H "x-api-key: <api-key>" \
  -d '{"name": "Test"}'

# 5. Test with JWT - should work (bypasses scope check)
curl -X POST http://localhost:8080/api/forms \
  -H "Authorization: Bearer <jwt>" \
  -d '{"name": "Test"}'
```

---

**Last Updated:** 2025-10-20
