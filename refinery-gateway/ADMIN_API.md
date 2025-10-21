# Admin API Documentation

Complete API reference for managing users, API keys, and viewing analytics.

## Authentication

All admin endpoints require:
1. **JWT token** (from login)
2. **Admin role** (`roles: ['admin']`)

```bash
# Login as admin
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "secret"}'

# Use token in admin requests
export TOKEN="eyJhbGc..."
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/admin/users
```

---

## User Management

### List Users
```bash
GET /admin/users?page=1&limit=20
```

**Response:**
```json
{
  "users": [
    {
      "_id": "123",
      "email": "user@example.com",
      "name": "John Doe",
      "roles": ["user"],
      "active": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Get Single User
```bash
GET /admin/users/:id
```

**Response:**
```json
{
  "_id": "123",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["user"],
  "active": true,
  "apiKeysCount": 3,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### Create User
```bash
POST /admin/users
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "secure-password",
  "name": "Jane Smith",
  "roles": ["user"]  // optional, defaults to ["user"]
}
```

**Response:**
```json
{
  "_id": "456",
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "roles": ["user"],
  "active": true
}
```

### Update User
```bash
PUT /admin/users/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "roles": ["user", "admin"],
  "active": false
}
```

### Delete User (Soft Delete)
```bash
DELETE /admin/users/:id
```

**Note:** Deactivates user and revokes all their API keys.

---

## API Key Management

### List API Keys
```bash
# All keys
GET /admin/api-keys?page=1&limit=20

# Keys for specific user
GET /admin/api-keys?userId=123
```

**Response:**
```json
{
  "apiKeys": [
    {
      "_id": "789",
      "name": "Production Key",
      "userId": "123",
      "keyPreview": "rfy_abc123...6789",
      "active": true,
      "scopes": ["read", "write"],
      "lastUsedAt": "2025-01-15T12:00:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### Get Single API Key
```bash
GET /admin/api-keys/:id
```

### Create API Key
```bash
POST /admin/api-keys
Content-Type: application/json

{
  "userId": "123",
  "name": "Production API Key",
  "scopes": ["read", "write"],
  "expiresAt": "2026-01-01T00:00:00.000Z"  // optional
}
```

**Response:**
```json
{
  "apiKey": "rfy_abc123def456...",
  "message": "API key created successfully. Save this key - it will not be shown again."
}
```

⚠️ **Important:** The full API key is only returned once!

### Revoke API Key
```bash
DELETE /admin/api-keys/:id
```

### Activate API Key
```bash
PUT /admin/api-keys/:id/activate
```

---

## Analytics

### Overview Analytics
```bash
GET /admin/analytics/overview?startDate=2025-01-01&endDate=2025-01-31
```

**Response:**
```json
{
  "totalRequests": 15420,
  "avgResponseTime": 245,
  "statusBreakdown": {
    "200": 14500,
    "400": 520,
    "429": 200,
    "500": 200
  }
}
```

### User Analytics
```bash
GET /admin/analytics/users/:userId?startDate=2025-01-01
```

**Response:**
```json
{
  "totalRequests": 523,
  "avgResponseTime": 180,
  "statusBreakdown": {
    "200": 500,
    "400": 23
  }
}
```

### Top API Paths
```bash
GET /admin/analytics/top-paths?limit=10&startDate=2025-01-01
```

**Response:**
```json
[
  {
    "_id": "/api/va-knowledge/search",
    "count": 5420,
    "avgResponseTime": 230
  },
  {
    "_id": "/api/forms/generate",
    "count": 3210,
    "avgResponseTime": 450
  }
]
```

### Error Logs
```bash
GET /admin/analytics/errors?limit=50
```

**Response:**
```json
[
  {
    "_id": "abc123",
    "method": "POST",
    "path": "/api/va-knowledge/extract",
    "statusCode": 500,
    "errorMessage": "Internal server error",
    "userId": "123",
    "createdAt": "2025-01-15T12:30:00.000Z"
  }
]
```

---

## System Stats

### Get System Statistics
```bash
GET /admin/stats
```

**Response:**
```json
{
  "users": {
    "total": 145,
    "active": 120,
    "inactive": 25
  },
  "apiKeys": {
    "total": 320,
    "active": 280,
    "revoked": 40
  }
}
```

---

## Complete cURL Examples

### 1. Create First Admin User

```bash
# Register admin user (manually set role to 'admin' in MongoDB)
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@refinery.com",
    "password": "SecureAdminPass123!",
    "name": "Admin User"
  }'

# Update user role in MongoDB Compass:
# users collection -> find user -> edit roles: ["user", "admin"]

# Login as admin
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@refinery.com",
    "password": "SecureAdminPass123!"
  }'

# Save the token
export ADMIN_TOKEN="<token-from-response>"
```

### 2. Create Regular User

```bash
curl -X POST http://localhost:8080/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@company.com",
    "password": "DevPassword123!",
    "name": "Developer User",
    "roles": ["user"]
  }'
```

### 3. Create API Key for User

```bash
# Get user ID from list users or previous response
export USER_ID="123abc..."

curl -X POST http://localhost:8080/admin/api-keys \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "name": "Production API Key",
    "scopes": ["read", "write"]
  }'

# Save the API key from response!
export API_KEY="rfy_..."
```

### 4. Test API Key

```bash
curl -X GET http://localhost:8080/api/va-knowledge/health \
  -H "x-api-key: $API_KEY"
```

### 5. View Analytics

```bash
# Overview
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/admin/analytics/overview?startDate=2025-01-01"

# Top paths
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/admin/analytics/top-paths?limit=5"

# Errors
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/admin/analytics/errors?limit=10"
```

---

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Refinery Gateway Admin API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    },
    {
      "key": "adminToken",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@refinery.com\",\n  \"password\": \"password\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    },
    {
      "name": "Users",
      "item": [
        {
          "name": "List Users",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/admin/users",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ]
          }
        },
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/admin/users",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"password123\",\n  \"name\": \"New User\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

---

## Security Notes

⚠️ **Important:**
- Admin endpoints are protected by both JWT and Admin role
- First admin must be created via registration + manual role update in DB
- API keys are only shown once during creation
- Deleted users are soft-deleted (deactivated)
- All requests are logged for audit trail

---

## Quick Setup Checklist

- [ ] Start gateway: `npm run start:dev`
- [ ] Register first user via `/auth/register`
- [ ] Update user role to `admin` in MongoDB
- [ ] Login as admin to get JWT token
- [ ] Create additional users via `/admin/users`
- [ ] Generate API keys for users
- [ ] Test API key with proxied endpoints
- [ ] Monitor usage via `/admin/analytics`
