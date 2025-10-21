# Refinery API Gateway

NestJS-based API Gateway with MongoDB authentication, rate limiting, and request logging.

## Features

✅ **Authentication**
- JWT-based authentication
- API key authentication
- User management with MongoDB

✅ **Rate Limiting**
- Configurable request limits
- Per-user and per-IP tracking
- Standard rate limit headers

✅ **Request Logging**
- MongoDB-based analytics
- Response time tracking
- Error logging
- Usage statistics

✅ **Service Routing**
- Proxy to backend services
- Header forwarding
- User context injection

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/refinery-gateway
JWT_SECRET=your-secret-key
```

### 3. Start Development Server
```bash
npm run start:dev
```

Gateway will run on `http://localhost:8080`

## Architecture

```
Client Request
    ↓
API Gateway (Port 8080)
    ↓
├─ Authentication (JWT or API Key)
├─ Rate Limiting
├─ Request Logging
    ↓
Backend Services
    ├─ VA Knowledge Service (3001)
    ├─ Forms Service (3002)
    └─ Processor Service (3003)
```

## Authentication

### Option 1: API Key (Recommended for Service-to-Service)

```bash
# Get API key (after creating user)
curl -X POST http://localhost:8080/auth/api-key \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "My API Key", "scopes": ["read", "write"]}'
```

Use API key in requests:
```bash
curl -X GET http://localhost:8080/api/va-knowledge/search \
  -H "x-api-key: rfy_abc123..."
```

### Option 2: JWT (User Authentication)

```bash
# Register user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret", "name": "John Doe"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret"}'
```

Use JWT in requests:
```bash
curl -X GET http://localhost:8080/api/va-knowledge/search \
  -H "Authorization: Bearer <jwt-token>"
```

## Routing

Gateway routes requests to backend services:

| Path Pattern | Backend Service | Environment Variable |
|--------------|----------------|---------------------|
| `/api/va-knowledge/*` | VA Knowledge API | `VA_KNOWLEDGE_SERVICE_URL` |
| `/api/forms/*` | Forms Service | `FORMS_SERVICE_URL` |
| `/api/processor/*` | Processor Service | `PROCESSOR_SERVICE_URL` |

Example:
```bash
# Request to gateway
GET http://localhost:8080/api/va-knowledge/search?q=ptsd

# Proxied to
GET http://localhost:3001/search?q=ptsd
```

## Rate Limiting

Default limits (configurable):
- **100 requests per minute** per user/IP
- Returns `429 Too Many Requests` when exceeded

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-10-20T12:00:00.000Z
```

Configure in `.env`:
```env
RATE_LIMIT_TTL=60000     # 1 minute window
RATE_LIMIT_MAX=100       # Max requests per window
```

## Analytics

View request statistics:

```typescript
// Get stats for a user
GET /analytics/stats?userId=123&startDate=2025-01-01

// Response
{
  "totalRequests": 1542,
  "avgResponseTime": 245,
  "statusBreakdown": {
    "200": 1450,
    "400": 50,
    "500": 42
  }
}

// Top paths
GET /analytics/top-paths?limit=10

// Error logs
GET /analytics/errors?limit=50
```

## Deployment

### Railway

1. **Create new Railway service:**
```bash
railway init
```

2. **Set environment variables in Railway:**
```
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
VA_KNOWLEDGE_SERVICE_URL=http://refinery-api:3001
FORMS_SERVICE_URL=http://refinery-forms:3002
```

3. **Deploy:**
```bash
railway up
```

### Docker

```bash
# Build
docker build -t refinery-gateway .

# Run
docker run -p 8080:8080 \
  -e MONGODB_URI=mongodb://... \
  -e JWT_SECRET=secret \
  refinery-gateway
```

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── auth.service.ts      # JWT & API key logic
│   ├── strategies/          # Passport strategies
│   └── guards/              # Auth guards
├── rate-limit/              # Rate limiting
│   ├── rate-limit.service.ts
│   └── rate-limit.guard.ts
├── analytics/               # Request logging
│   └── analytics.service.ts
├── gateway/                 # Proxy routing
│   ├── gateway.controller.ts
│   └── gateway.service.ts
└── common/
    └── schemas/             # MongoDB schemas
        ├── user.schema.ts
        ├── api-key.schema.ts
        └── request-log.schema.ts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Gateway port | `8080` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/refinery-gateway` |
| `JWT_SECRET` | JWT signing key | ⚠️ Required |
| `JWT_EXPIRATION` | JWT expiration | `24h` |
| `RATE_LIMIT_TTL` | Rate limit window (ms) | `60000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `VA_KNOWLEDGE_SERVICE_URL` | VA Knowledge backend | ⚠️ Required |
| `FORMS_SERVICE_URL` | Forms backend | ⚠️ Required |
| `PROCESSOR_SERVICE_URL` | Processor backend | ⚠️ Required |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

## API Reference

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password",
  "name": "John Doe"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password"
}

Response:
{
  "access_token": "eyJhbGc...",
  "user": { ... }
}
```

#### Create API Key
```
POST /auth/api-key
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Production Key",
  "scopes": ["read", "write"]
}

Response:
{
  "apiKey": "rfy_abc123..."
}
```

### Proxied Endpoints

All requests matching these patterns are proxied:
- `/api/va-knowledge/*` → VA Knowledge Service
- `/api/forms/*` → Forms Service
- `/api/processor/*` → Processor Service

Authentication required via JWT or API key.

## Security Notes

⚠️ **Production Checklist:**
- [ ] Change `JWT_SECRET` to strong random value
- [ ] Use HTTPS only
- [ ] Set strong MongoDB credentials
- [ ] Configure proper CORS origins
- [ ] Enable MongoDB authentication
- [ ] Review rate limits for your use case
- [ ] Set up monitoring/alerts
- [ ] Regular security updates

## Troubleshooting

**Gateway can't reach backend services:**
- Check `*_SERVICE_URL` environment variables
- Ensure backend services are running
- Verify network connectivity (Docker networks, Railway internal URLs)

**Authentication failing:**
- Check `JWT_SECRET` matches between services
- Verify MongoDB connection
- Check API key is active and not expired

**Rate limiting too aggressive:**
- Adjust `RATE_LIMIT_TTL` and `RATE_LIMIT_MAX`
- Check logs for per-user vs per-IP limiting

## Development

```bash
# Run tests
npm test

# Run in watch mode
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod
```

## License

UNLICENSED - Private project
