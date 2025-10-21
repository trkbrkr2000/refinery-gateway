# API Route Organization

## Overview

The gateway exposes **public APIs** and filters out **internal APIs** that are only meant for service-to-service communication.

## Public Routes (Exposed via Gateway)

All routes accessible through the gateway at `http://localhost:8080`

### Gateway Routes
- `GET /health` - Health check endpoint (no auth required)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout (requires JWT)
- `POST /auth/api-key` - Create API key (requires JWT)

### Admin Routes (requires JWT)
- `GET /admin/users` - List all users
- `GET /admin/users/:id` - Get user details
- `POST /admin/users` - Create user
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/api-keys` - List all API keys
- `GET /admin/api-keys/:id` - Get API key details
- `POST /admin/api-keys` - Create API key
- `DELETE /admin/api-keys/:id` - Revoke API key
- `PUT /admin/api-keys/:id/activate` - Activate API key
- `GET /admin/analytics/overview` - Analytics overview
- `GET /admin/analytics/users/:userId` - User analytics
- `GET /admin/analytics/top-paths` - Most used paths
- `GET /admin/analytics/errors` - Error analytics
- `GET /admin/stats` - Gateway statistics

### Proxied Backend Routes (requires API Key)

All these routes are proxied to backend services with authentication and rate limiting.

#### VA Knowledge Service (`/api/va-knowledge/*`)
Proxied to refinery-api (port 3001)
- `GET /api/va-knowledge/search` - Search VA regulations
- `GET /api/va-knowledge/documents/:id` - Get document by ID
- `GET /api/va-knowledge/documents/citation/:citation` - Get by citation
- `GET /api/va-knowledge/chunks/:id` - Get text chunk
- `GET /api/va-knowledge/documents/:id/chunks` - Get document chunks
- `POST /api/va-knowledge/explain` - Explain VA regulation
- `POST /api/va-knowledge/analyze-decision` - Analyze decision letter

#### Forms Service (`/api/forms/*`)
Proxied to refinery-api (port 3001)
- `GET /api/forms` - List available forms
- `GET /api/forms/:formId/schema` - Get form schema
- `POST /api/forms/:formId/generate` - Generate filled PDF
- `POST /api/forms/:formId/submissions` - Submit form data
- `GET /api/forms/:formId/submissions` - Get form submissions
- `GET /api/forms/analytics/overview` - Forms analytics

#### Processor Service (`/api/processor/*`)
Proxied to refinery-python (port 8000)
- PDF processing endpoints (defined in FastAPI service)

## Internal Routes (NOT Exposed via Gateway)

These routes are **filtered out** and not accessible through the gateway. They are only for service-to-service communication.

### Internal Queue Routes (refinery-api)
❌ **NOT accessible** via gateway
- `POST /internal/queue/document-extracted` - Callback from refinery-python
- `POST /internal/queue/spans-ready` - Callback from refinery-python
- `POST /internal/queue/document-indexed` - Callback from refinery-python

**Why internal?** These endpoints are called by refinery-python to notify refinery-api about completed processing jobs. They should only be accessible within the internal network, not through the public gateway.

## How It Works

### Filtering Logic

The **SwaggerMergerService** ([swagger-merger.service.ts](./src/gateway/swagger-merger.service.ts)) filters routes when merging OpenAPI docs:

```typescript
// Skip internal routes (those starting with /internal/)
if (path.startsWith('/internal/') || path.startsWith('internal/')) {
  console.log(`🔒 Skipping internal route: ${path} from ${service.name}`);
  return;
}
```

### Route Proxying

The **GatewayController** ([gateway.controller.ts](./src/gateway/gateway.controller.ts)) proxies public routes:

```typescript
@All('api/va-knowledge/*')
@UseGuards(ApiKeyGuard, RateLimitGuard)
async proxyVaKnowledge(@Req() req: Request, @Res() res: Response) {
  return this.proxyRequest(req, res, 'VA_KNOWLEDGE_SERVICE_URL');
}
```

## Security

### Authentication
- **Gateway routes** (`/auth/*`): Some require JWT, some are public
- **Admin routes** (`/admin/*`): Require JWT token
- **Proxied routes** (`/api/*`): Require API key
- **Internal routes**: Filtered out, not accessible

### Rate Limiting
All proxied routes (`/api/*`) have rate limiting applied via `RateLimitGuard`.

## API Documentation

- **Unified Swagger**: http://localhost:8080/api/docs
  - Shows ALL public routes from gateway + backend services
  - Internal routes are automatically excluded

- **Gateway-only Swagger**: http://localhost:8080/api/docs/gateway
  - Shows only gateway's own endpoints (auth, admin, health)

## Adding New Routes

### Public Routes
1. Add controller/endpoint to backend service
2. Ensure route starts with `/api/v1/` (not `/internal/`)
3. Gateway will automatically include it in unified Swagger docs

### Internal Routes
1. Use `/internal/` prefix for the controller route
2. Gateway will automatically exclude it from Swagger docs
3. Only accessible directly to the backend service (port 3001 or 8000)

Example:
```typescript
// This will be PUBLIC (exposed via gateway)
@Controller('api/v1/documents')
export class DocumentsController { ... }

// This will be INTERNAL (hidden from gateway)
@Controller('internal/queue')
export class QueuesController { ... }
```

## Environment Configuration

Set backend service URLs in [.env](./env):

```env
VA_KNOWLEDGE_SERVICE_URL=http://localhost:3001
FORMS_SERVICE_URL=http://localhost:3001
PROCESSOR_SERVICE_URL=http://localhost:8000
```

## Summary

| Route Pattern | Accessibility | Auth Required | Filtered |
|---------------|---------------|---------------|----------|
| `/health` | Public | No | No |
| `/auth/*` | Public | Varies | No |
| `/admin/*` | Public | JWT | No |
| `/api/va-knowledge/*` | Public | API Key | No |
| `/api/forms/*` | Public | API Key | No |
| `/api/processor/*` | Public | API Key | No |
| `/internal/*` | **Internal Only** | N/A | **Yes** ✅ |
