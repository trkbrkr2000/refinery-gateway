# Redis Integration Guide

Redis support has been added to the API Gateway for production-grade performance and scalability.

## Features

✅ **Rate Limiting** - Persistent, shared across instances
✅ **Response Caching** - Speed up frequent requests
✅ **Token Blacklist** - Instant token revocation
✅ **Graceful Fallback** - Works without Redis (in-memory)

---

## Quick Start

### Option 1: Railway (Recommended)

```bash
# Add Redis plugin in Railway dashboard
railway add redis

# Redeploy - REDIS_URL is auto-injected
railway up
```

### Option 2: Local Development

```bash
# Start Redis locally
docker run -d -p 6379:6379 redis:7-alpine

# Or with Redis CLI
redis-server

# Add to .env
REDIS_URL=redis://localhost:6379
```

### Option 3: No Redis (Testing)

Just don't set `REDIS_URL` - gateway falls back to in-memory storage.

---

## What Redis Powers

### 1. Rate Limiting

**Without Redis:**
- Stored in memory (Map)
- Lost on restart
- Not shared across instances

**With Redis:**
```typescript
// Atomic increment, survives restarts
ratelimit:user123 → count: 45, TTL: 15s
```

**Benefits:**
- ✅ Persistent across restarts
- ✅ Shared across multiple gateway instances
- ✅ Accurate rate limiting

### 2. Response Caching

Cache GET responses to reduce backend load:

```typescript
// Cache key format
cache:user123:/api/va-knowledge/search:{"q":"ptsd"}

// 1 minute TTL by default
```

**Example:**
```bash
# First request - MISS (hits backend)
GET /api/va-knowledge/search?q=ptsd
Response time: 450ms

# Second request - HIT (from cache)
GET /api/va-knowledge/search?q=ptsd
Response time: 15ms ⚡
```

### 3. Token Blacklist

Revoke JWT tokens instantly:

```bash
POST /auth/logout
# Blacklists token for remaining validity (24h)

# Subsequent requests with that token
GET /admin/users
→ 401 Unauthorized: Token has been revoked
```

**How it works:**
```typescript
blacklist:<token-hash> → TTL: 86400s (24h)
```

---

## Configuration

### Environment Variables

```env
# Optional - gateway works without it
REDIS_URL=redis://localhost:6379

# Or for Railway Redis with password
REDIS_URL=redis://:password@redis.railway.internal:6379
```

### Rate Limit Settings

```env
RATE_LIMIT_TTL=60000      # 1 minute window
RATE_LIMIT_MAX=100        # 100 requests per window
```

---

## Redis Commands (Debugging)

### Check Rate Limits
```bash
# Connect to Redis
redis-cli

# View all rate limit keys
KEYS ratelimit:*

# Check specific user's count
GET ratelimit:user123
TTL ratelimit:user123
```

### Check Cached Responses
```bash
# View all cache keys
KEYS cache:*

# Get cached response
GET "cache:user123:/api/va-knowledge/search:{\"q\":\"ptsd\"}"

# Clear all cache
FLUSHDB
```

### Check Blacklisted Tokens
```bash
# View blacklisted tokens
KEYS blacklist:*

# Check if token is blacklisted
EXISTS blacklist:eyJhbGc...
```

---

## Performance Impact

| Feature | Without Redis | With Redis |
|---------|--------------|------------|
| **Rate Limiting** | In-memory Map | Atomic INCR |
| **Restart Persistence** | ❌ Lost | ✅ Persisted |
| **Multi-Instance** | ❌ Separate | ✅ Shared |
| **Response Cache** | ❌ None | ✅ 1min TTL |
| **Token Revocation** | ❌ Can't revoke | ✅ Instant |

### Example Metrics

**Without Redis:**
- Rate limit check: ~0.1ms (Map lookup)
- No caching: Every request hits backend
- Token revocation: Not possible

**With Redis:**
- Rate limit check: ~2ms (network + Redis)
- Cache hit: ~3ms (vs 200-500ms backend)
- Token revocation: Instant

---

## Railway Setup

### 1. Add Redis Plugin

```bash
# Via CLI
railway add redis

# Or in dashboard:
# Project → Add Service → Redis
```

### 2. Verify Connection

Railway auto-injects `REDIS_URL`. Check logs:

```
✅ Redis connected
🚀 API Gateway running on http://localhost:8080
```

If you see:
```
⚠️  Redis not available - using in-memory fallback
```

Redis isn't connected. Check `REDIS_URL` env var.

### 3. Test Redis

```bash
# Check rate limiting persists
curl -H "x-api-key: rfy_..." http://your-gateway.railway.app/api/va-knowledge/health

# Check X-RateLimit-Remaining header
# Make 100+ requests - should get 429

# Restart gateway - rate limits should persist
railway restart
```

---

## Scaling

### Horizontal Scaling (Multiple Instances)

**With Redis:**
```
┌─────────────┐
│  Gateway 1  │ ──┐
└─────────────┘   │
                  ├──→ Redis ←── Shared rate limits
┌─────────────┐   │              Shared cache
│  Gateway 2  │ ──┘
└─────────────┘
```

Rate limits are accurate across all instances.

**Without Redis:**
```
┌─────────────┐
│  Gateway 1  │ ← User gets 100 req/min here
└─────────────┘

┌─────────────┐
│  Gateway 2  │ ← User gets ANOTHER 100 req/min here!
└─────────────┘
```

Rate limits are per-instance (not ideal).

---

## Advanced Usage

### Custom Cache TTL

Edit `src/gateway/interceptors/cache.interceptor.ts`:

```typescript
private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes
```

### Disable Caching for Specific Paths

```typescript
// In cache.interceptor.ts
if (request.path.includes('/admin')) {
  return next.handle(); // Skip cache
}
```

### Pub/Sub (Optional)

Redis pub/sub for real-time events:

```typescript
// Publisher
await redisService.publish('user-events', JSON.stringify({
  type: 'user.created',
  userId: '123'
}));

// Subscriber
redisService.subscribe('user-events', (message) => {
  console.log('Event:', JSON.parse(message));
});
```

---

## Monitoring

### Redis Metrics

```bash
# Connect to Redis
redis-cli

# Get info
INFO stats

# Check memory usage
INFO memory

# Monitor commands in real-time
MONITOR
```

### Application Logs

```bash
# Check cache hits/misses
[Cache] HIT: cache:user123:/api/va-knowledge/search:{}
[Cache] MISS: cache:user456:/api/forms/list:{}
```

---

## Troubleshooting

### Redis Not Connecting

**Check logs:**
```
⚠️  Redis not available - using in-memory fallback
```

**Solutions:**
1. Verify `REDIS_URL` is set
2. Check Redis is running: `redis-cli ping`
3. Check Railway Redis plugin is active

### High Memory Usage

**Solution:** Set maxmemory policy in Redis:

```bash
# In redis.conf or Railway Redis config
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Cache Stale Data

**Clear cache:**
```bash
curl -X DELETE http://localhost:8080/admin/cache/clear \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Or manually:
```bash
redis-cli FLUSHDB
```

---

## Production Checklist

- [ ] `REDIS_URL` set in Railway
- [ ] Verify connection in logs: `✅ Redis connected`
- [ ] Test rate limiting persists across restarts
- [ ] Test token blacklist (logout + try to use token)
- [ ] Monitor Redis memory usage
- [ ] Set up Redis backups (Railway handles this)
- [ ] Configure maxmemory policy

---

## Summary

✅ **Added:** Redis support with graceful fallback
✅ **Rate Limiting:** Persistent, shared across instances
✅ **Caching:** 1min TTL for GET requests
✅ **Token Blacklist:** Instant logout
✅ **Zero Config:** Works without Redis for dev/testing

**For Production:** Add Railway Redis plugin - everything just works!
