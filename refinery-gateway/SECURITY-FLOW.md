# API Gateway Security Flow

## Complete User Journey: Registration → Authentication → API Access

---

## 🔄 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. FIRST TIME USER                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    User visits website
                    (refinery-frontend)
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  POST /auth/register            │
            │  {                              │
            │    email: "user@example.com",   │
            │    password: "********",        │
            │    name: "John Doe"             │
            │  }                              │
            └─────────────────┬───────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  Gateway validates input        │
            │  - Email format check           │
            │  - Password strength check      │
            └─────────────────┬───────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  AuthService.register()         │
            │  - Hash password (bcrypt)       │
            │  - Save to MongoDB              │
            │  - Assign role: ['user']        │
            └─────────────────┬───────────────┘
                              │
                              ▼
                    ✅ User created
                    Returns: { id, email, name, roles }

┌─────────────────────────────────────────────────────────────────┐
│                    2. LOGIN PROCESS                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  POST /auth/login               │
            │  {                              │
            │    email: "user@example.com",   │
            │    password: "********"         │
            │  }                              │
            └─────────────────┬───────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  AuthService.validateUser()     │
            │  1. Find user by email          │
            │  2. Check user.active === true  │
            │  3. bcrypt.compare(password)    │
            └─────────────────┬───────────────┘
                              │
                         Valid? │
                    ┌───────────┴───────────┐
                    │                       │
                   NO                      YES
                    │                       │
                    ▼                       ▼
            ❌ 401 Unauthorized    ┌─────────────────────┐
                                   │ AuthService.login() │
                                   │ Create JWT payload: │
                                   │ {                   │
                                   │   sub: userId,      │
                                   │   email: email,     │
                                   │   roles: ['user']   │
                                   │ }                   │
                                   └──────────┬──────────┘
                                              │
                                              ▼
                                   ┌──────────────────────┐
                                   │ Sign JWT token       │
                                   │ (expires in 24h)     │
                                   └──────────┬───────────┘
                                              │
                                              ▼
                    ✅ Return to frontend:
                    {
                      access_token: "eyJhbGc...",
                      user: {
                        id: "...",
                        email: "user@example.com",
                        name: "John Doe",
                        roles: ["user"]
                      }
                    }
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  Frontend stores token          │
            │  - localStorage.setItem()       │
            │  - OR sessionStorage            │
            │  - OR secure cookie             │
            └─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 3. CREATE API KEY (OPTIONAL)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  POST /auth/api-key             │
            │  Headers:                       │
            │    Authorization: Bearer <JWT>  │
            │  Body:                          │
            │  {                              │
            │    name: "My App Key",          │
            │    scopes: ["forms:read"]       │
            │  }                              │
            └─────────────────┬───────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  JwtAuthGuard validates token   │
            │  1. Extract Bearer token        │
            │  2. Verify signature            │
            │  3. Check expiration            │
            │  4. Check Redis blacklist       │
            └─────────────────┬───────────────┘
                              │
                         Valid? │
                    ┌───────────┴───────────┐
                    │                       │
                   NO                      YES
                    │                       │
                    ▼                       ▼
            ❌ 401 Unauthorized    ┌─────────────────────┐
                                   │ Generate API key    │
                                   │ Format: rfy_{64hex} │
                                   │ Save to MongoDB:    │
                                   │ - key               │
                                   │ - name              │
                                   │ - userId            │
                                   │ - scopes            │
                                   │ - active: true      │
                                   └──────────┬──────────┘
                                              │
                                              ▼
                    ✅ Return API key (ONCE):
                    {
                      apiKey: "rfy_abc123...",
                      message: "Save this - won't show again"
                    }
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  User saves API key securely    │
            │  - Environment variable         │
            │  - Secret manager               │
            │  - Config file (gitignored)     │
            └─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              4. ACCESSING BACKEND SERVICES                      │
└─────────────────────────────────────────────────────────────────┘

   Option A: Using JWT (for user actions)
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  Frontend makes request:        │
            │  GET /api/va-knowledge/search   │
            │  Headers:                       │
            │    Authorization: Bearer <JWT>  │
            │  (NOT CURRENTLY WORKING - see   │
            │   Option B below)               │
            └─────────────────────────────────┘

   Option B: Using API Key (CURRENT METHOD)
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  Frontend makes request:        │
            │  GET /api/va-knowledge/search?  │
            │       q=PTSD                    │
            │  Headers:                       │
            │    x-api-key: rfy_abc123...     │
            └─────────────────┬───────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  Gateway receives request       │
            │  Route: /api/va-knowledge/*     │
            └─────────────────┬───────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  ApiKeyGuard.canActivate()      │
            │  1. Extract x-api-key header    │
            │  2. Call validateApiKey()       │
            └─────────────────┬───────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  AuthService.validateApiKey()   │
            │  1. Find key in MongoDB         │
            │  2. Check active === true       │
            │  3. Check expiration            │
            │  4. Update lastUsedAt           │
            └─────────────────┬───────────────┘
                              │
                         Valid? │
                    ┌───────────┴───────────┐
                    │                       │
                   NO                      YES
                    │                       │
                    ▼                       ▼
            ❌ 401 Invalid API Key  ┌──────────────────┐
                                    │ RateLimitGuard   │
                                    │ Check Redis:     │
                                    │ user:{id}:count  │
                                    │ Limit: 100/min   │
                                    └────────┬─────────┘
                                             │
                                        Under limit?
                                    ┌────────┴─────────┐
                                    │                  │
                                   NO                 YES
                                    │                  │
                                    ▼                  ▼
                            ❌ 429 Rate Limit   ┌──────────────┐
                                                │ Proxy to     │
                                                │ Backend:     │
                                                │ refinery-api │
                                                │ :3001        │
                                                └──────┬───────┘
                                                       │
                                                       ▼
                                                ┌──────────────┐
                                                │ Backend      │
                                                │ processes    │
                                                │ request      │
                                                └──────┬───────┘
                                                       │
                                                       ▼
                                                ✅ Response
                                                returned to
                                                frontend

┌─────────────────────────────────────────────────────────────────┐
│                      5. LOGOUT                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  POST /auth/logout              │
            │  Headers:                       │
            │    Authorization: Bearer <JWT>  │
            └─────────────────┬───────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  JwtAuthGuard validates token   │
            └─────────────────┬───────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  Extract JWT token              │
            │  Add to Redis blacklist         │
            │  TTL = token remaining validity │
            │  (up to 24 hours)               │
            └─────────────────┬───────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  Frontend clears token          │
            │  localStorage.removeItem()      │
            └─────────────────────────────────┘
                              │
                              ▼
                    ✅ User logged out
```

---

## 🔐 Security Layers

### Layer 1: Authentication
- **JWT Tokens** (24-hour expiry)
  - Used for user authentication
  - Signed with `JWT_SECRET`
  - Contains: `{ sub: userId, email, roles }`
  - Extracted via `Authorization: Bearer <token>`

- **API Keys** (long-lived)
  - Format: `rfy_{64-character-hex}`
  - Scoped permissions
  - Trackable (lastUsedAt timestamp)
  - Revocable per user
  - Extracted via `x-api-key` header

### Layer 2: Authorization
- **Guards**
  - `JwtAuthGuard` - Validates JWT tokens
  - `ApiKeyGuard` - Validates API keys
  - Both check active status

- **Roles** (future use)
  - Stored in user document
  - Default: `['user']`
  - Can expand to: `['user', 'admin', 'premium']`

### Layer 3: Rate Limiting
- **Per-user limits** (via Redis)
  - Default: 100 requests/minute
  - Key pattern: `ratelimit:user:{userId}`
  - Shared across all API keys for same user

### Layer 4: Token Blacklisting
- **Logout invalidation**
  - JWT added to Redis blacklist on logout
  - TTL matches token remaining validity
  - Prevents token reuse after logout

---

## 📊 Data Models

### User (MongoDB)
```typescript
{
  _id: ObjectId,
  email: string (unique),
  password: string (bcrypt hashed),
  name: string,
  active: boolean (default: true),
  roles: string[] (default: ['user']),
  metadata: object,
  createdAt: Date,
  updatedAt: Date
}
```

### API Key (MongoDB)
```typescript
{
  _id: ObjectId,
  key: string (unique, format: rfy_{64hex}),
  name: string,
  userId: string (reference to User),
  active: boolean (default: true),
  scopes: string[] (default: []),
  expiresAt?: Date (optional),
  lastUsedAt?: Date,
  metadata: object,
  createdAt: Date,
  updatedAt: Date
}
```

### Redis Keys
```
# Token blacklist
blacklist:token:{jwt_token} → "1" (TTL: remaining token validity)

# Rate limiting
ratelimit:user:{userId} → counter (TTL: 60 seconds)
```

---

## 🛡️ Security Best Practices

### Password Security
- ✅ Hashed with bcrypt (salt rounds: 10)
- ✅ Never returned in API responses
- ✅ Validated before hashing

### Token Security
- ✅ JWT signed with secret key
- ✅ 24-hour expiration
- ✅ Blacklisted on logout
- ✅ Checked for expiration on every request

### API Key Security
- ✅ Cryptographically random (32 bytes)
- ✅ Prefixed with `rfy_` for identification
- ✅ Shown only once on creation
- ✅ Revocable per user
- ✅ Trackable usage via `lastUsedAt`

### Rate Limiting
- ✅ Per-user (not per-key)
- ✅ Redis-backed (with in-memory fallback)
- ✅ Configurable limits
- ✅ 429 status on limit exceeded

---

## 🔧 Configuration

### Environment Variables
```env
# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# MongoDB
MONGODB_URI=mongodb://localhost:27017/refinery

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Backend Services
VA_KNOWLEDGE_SERVICE_URL=http://localhost:3001
FORMS_SERVICE_URL=http://localhost:3001
PROCESSOR_SERVICE_URL=http://localhost:8000

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

---

## 📋 Frontend Integration Guide

### Step 1: Registration
```typescript
// Register new user
const response = await fetch('http://localhost:8080/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    name: 'John Doe'
  })
});

const user = await response.json();
// { _id, email, name, roles, createdAt }
```

### Step 2: Login
```typescript
// Login
const response = await fetch('http://localhost:8080/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});

const { access_token, user } = await response.json();

// Store token
localStorage.setItem('access_token', access_token);
localStorage.setItem('user', JSON.stringify(user));
```

### Step 3: Create API Key (Optional)
```typescript
// Create API key for programmatic access
const response = await fetch('http://localhost:8080/auth/api-key', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  },
  body: JSON.stringify({
    name: 'My Web App',
    scopes: ['forms:read', 'va-knowledge:search']
  })
});

const { apiKey } = await response.json();

// SAVE THIS - it won't be shown again!
localStorage.setItem('api_key', apiKey);
```

### Step 4: Access Backend APIs
```typescript
// Using API Key (CURRENT METHOD)
const response = await fetch('http://localhost:8080/api/va-knowledge/search?q=PTSD', {
  headers: {
    'x-api-key': localStorage.getItem('api_key')
  }
});

const results = await response.json();
```

### Step 5: Logout
```typescript
// Logout
await fetch('http://localhost:8080/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});

// Clear local storage
localStorage.removeItem('access_token');
localStorage.removeItem('user');
localStorage.removeItem('api_key');
```

---

## 🚨 Error Handling

### Common Error Responses

**401 Unauthorized - Invalid credentials**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

**401 Unauthorized - Invalid API key**
```json
{
  "statusCode": 401,
  "message": "Invalid API key",
  "error": "Unauthorized"
}
```

**401 Unauthorized - Expired API key**
```json
{
  "statusCode": 401,
  "message": "API key expired",
  "error": "Unauthorized"
}
```

**429 Too Many Requests - Rate limit exceeded**
```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded",
  "error": "Too Many Requests"
}
```

---

## 🔄 Current vs Future State

### ⚠️ Current Limitations

1. **API Key Required for All Proxied Routes**
   - Even authenticated users with JWT must create API key
   - This is a temporary implementation

2. **No Role-Based Access Control (RBAC)**
   - All users have same permissions
   - Scopes stored but not enforced yet

3. **No Refresh Tokens**
   - JWT expires in 24 hours
   - User must re-login

### 🎯 Future Enhancements

1. **Dual Authentication Support**
   - Allow JWT OR API key for proxied routes
   - JWT for user sessions
   - API key for programmatic access

2. **Role-Based Access Control**
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin')
   async adminOnlyRoute() { ... }
   ```

3. **Refresh Tokens**
   - Long-lived refresh tokens
   - Short-lived access tokens (15 min)
   - Automatic token refresh

4. **Scope Enforcement**
   - Check API key scopes on each request
   - Deny access if scope missing

5. **OAuth2 Integration**
   - Google Sign-In
   - GitHub Sign-In
   - VA.gov OAuth

---

## 📚 Related Files

- [auth.controller.ts](src/auth/auth.controller.ts) - Authentication endpoints
- [auth.service.ts](src/auth/auth.service.ts) - Core authentication logic
- [jwt-auth.guard.ts](src/auth/guards/jwt-auth.guard.ts) - JWT validation
- [api-key.guard.ts](src/auth/guards/api-key.guard.ts) - API key validation
- [jwt.strategy.ts](src/auth/strategies/jwt.strategy.ts) - Passport JWT strategy
- [user.schema.ts](src/common/schemas/user.schema.ts) - User data model
- [api-key.schema.ts](src/common/schemas/api-key.schema.ts) - API key data model
- [API-ROUTES.md](API-ROUTES.md) - Route categorization

---

## 🧪 Testing the Flow

### Manual Testing
```bash
# 1. Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'

# 2. Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
# Save the access_token from response

# 3. Create API Key
curl -X POST http://localhost:8080/auth/api-key \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "Test Key",
    "scopes": []
  }'
# Save the apiKey from response

# 4. Access Backend API
curl http://localhost:8080/api/va-knowledge/search?q=PTSD \
  -H "x-api-key: <apiKey>"

# 5. Logout
curl -X POST http://localhost:8080/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

---

**Last Updated:** 2025-10-20
