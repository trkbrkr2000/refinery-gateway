# VA.gov Lighthouse Benefits Claims API v2

## API Discovery

You've specified we should use: `https://api.va.gov/internal/docs/benefits-claims/v2/openapi.json`

This is the **Lighthouse Benefits Claims API v2** - a more official, external-facing API.

---

## Key Endpoints (From OpenAPI Spec)

### 1. Get Claim Details
```
GET /veterans/{veteranId}/claims/{id}
```
**Purpose:** Retrieve detailed claim status tracking information

**Authentication:** OAuth 2.0 with `system/claim.read` scope

**Response:** Full claim details including status, evidence, timeline

### 2. Submit Claim (526EZ)
```
POST /veterans/{veteranId}/526/synchronous
```
**Purpose:** Submit disability compensation claim

**Authentication:** OAuth 2.0 with `system/claim.write` scope

### 3. Submit Evidence Waiver
```
POST /veterans/{veteranId}/claims/{id}/5103
```
**Purpose:** Submit Evidence Waiver 5103

---

## Authentication Challenge

### The Problem

**Lighthouse API requires:**
- OAuth 2.0 client credentials
- Pre-registration with VA
- Client ID and Client Secret
- Server-to-server authentication

**Chrome Extension has:**
- User's browser session cookies
- No way to securely store client secrets
- Runs in user's browser (not server)

### The Solution: Backend Proxy

**We need a backend service to:**
1. Register with VA Lighthouse as an OAuth client
2. Store client credentials securely
3. Proxy requests from Chrome extension
4. Exchange veteran's session for API access

---

## Proposed Architecture

```
┌─────────────────┐
│  Chrome Ext     │
│  (User Browser) │
└────────┬────────┘
         │ 1. Send user session token
         │
         ▼
┌─────────────────┐
│  Your Backend   │
│  (ClaimReady)   │  2. Validate user session
└────────┬────────┘
         │ 3. Call VA Lighthouse API
         │    with OAuth credentials
         ▼
┌─────────────────┐
│  VA Lighthouse  │
│  API v2         │
└─────────────────┘
```

---

## Implementation Plan

### Phase 1: Chrome Extension → Backend
**Extension collects:**
- User's VA.gov session cookies
- User identifies themselves to ClaimReady
- Sends authenticated request to YOUR backend

**Example:**
```javascript
// In Chrome extension
const response = await fetch('https://api.claimready.io/api/va/claims', {
  credentials: 'include', // Your ClaimReady session
  headers: {
    'Authorization': `Bearer ${claimReadyToken}`,
    'X-VA-Session': vaSessionCookie, // Forward VA session
  }
});
```

### Phase 2: Backend → VA Lighthouse API
**Your backend:**
1. Receives request from extension
2. Validates user is authorized
3. Uses stored OAuth credentials
4. Calls Lighthouse API on behalf of user
5. Returns claims data to extension

**Example (Node.js/NestJS):**
```typescript
// In your refinery-api
@Get('va/claims')
async getVAClaims(@Headers('x-va-session') vaSession: string) {
  // 1. Get OAuth token from VA
  const oauthToken = await this.getLighthouseToken();

  // 2. Extract veteran ID from session
  const veteranId = await this.getVeteranId(vaSession);

  // 3. Call Lighthouse API
  const response = await fetch(
    `https://api.va.gov/veterans/${veteranId}/claims`,
    {
      headers: {
        'Authorization': `Bearer ${oauthToken}`,
      }
    }
  );

  return response.json();
}
```

---

## VA Lighthouse Registration

### You Need To:

1. **Apply for Access**
   - Visit: https://developer.va.gov/
   - Request production credentials
   - Agree to VA terms

2. **Get OAuth Credentials**
   - Client ID
   - Client Secret
   - API keys

3. **Request Scopes**
   - `system/claim.read` - Read claims
   - `system/claim.write` - Submit claims

4. **Implement OAuth Flow**
   - Client credentials grant
   - Token refresh handling

---

## Updated Extension Flow

### Current (What We Built)
```
Extension → api.va.gov/v0/evss_claims_async
❌ May not work (internal API)
```

### Recommended (Using Your Backend)
```
1. Extension → ClaimReady API → VA Lighthouse API v2
2. Extension sends: User auth + VA session
3. Backend calls: Lighthouse API with OAuth
4. Backend returns: Claims data to extension
```

---

## What Needs to Change

### In Chrome Extension

**Before:**
```typescript
// Direct call to VA API
fetch('https://api.va.gov/v0/evss_claims_async', {
  credentials: 'include'
});
```

**After:**
```typescript
// Call YOUR backend, which then calls VA
fetch('https://api.claimready.io/api/va/claims', {
  headers: {
    'Authorization': `Bearer ${claimReadyToken}`,
  }
});
```

### In Your Backend (refinery-api)

**Add new endpoints:**
```typescript
// GET /api/va/claims - List all claims
// GET /api/va/claims/:id - Get claim details
// POST /api/va/claims/:id/evidence - Submit evidence
```

**Each endpoint:**
1. Authenticates ClaimReady user
2. Gets OAuth token from VA Lighthouse
3. Calls appropriate Lighthouse API endpoint
4. Returns data to extension

---

## Environment Variables Needed

```bash
# In refinery-api/.env
VA_LIGHTHOUSE_CLIENT_ID=your_client_id
VA_LIGHTHOUSE_CLIENT_SECRET=your_secret
VA_LIGHTHOUSE_API_URL=https://api.va.gov
VA_LIGHTHOUSE_TOKEN_URL=https://api.va.gov/oauth2/token
```

---

## Benefits of This Approach

✅ **Secure** - Client secrets stay on server, not in browser
✅ **Compliant** - Follows VA's OAuth requirements
✅ **Flexible** - You control the data flow
✅ **Cacheable** - Can cache claims data in your DB
✅ **Analyzable** - Can run AI analysis on claims before returning

---

## Quick Decision Tree

**Q: Can extension call VA Lighthouse API directly?**
❌ No - requires client secrets (can't be in browser)

**Q: Can extension call internal vets-api?**
⚠️ Maybe - but not recommended (internal/undocumented)

**Q: Should we use our backend as proxy?**
✅ Yes - this is the proper approach

---

## Next Steps

### Immediate (Extension Side)
1. ✅ Keep current API-based approach in extension
2. ✅ Update to call ClaimReady backend instead of VA directly
3. ✅ Pass ClaimReady auth token + any VA session info

### Required (Backend Side)
1. ⏸️ Register for VA Lighthouse API access
2. ⏸️ Implement OAuth 2.0 client credentials flow
3. ⏸️ Create `/api/va/*` endpoints in refinery-api
4. ⏸️ Proxy requests to VA Lighthouse API v2
5. ⏸️ Return formatted data to extension

---

## Example Backend Implementation

```typescript
// refinery-api/src/va-lighthouse/va-lighthouse.service.ts

@Injectable()
export class VaLighthouseService {
  private clientId = process.env.VA_LIGHTHOUSE_CLIENT_ID;
  private clientSecret = process.env.VA_LIGHTHOUSE_CLIENT_SECRET;
  private tokenCache: { token: string; expires: number } | null = null;

  async getOAuthToken(): Promise<string> {
    // Check cache
    if (this.tokenCache && this.tokenCache.expires > Date.now()) {
      return this.tokenCache.token;
    }

    // Get new token
    const response = await fetch('https://api.va.gov/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'system/claim.read',
      }),
    });

    const data = await response.json();

    // Cache token
    this.tokenCache = {
      token: data.access_token,
      expires: Date.now() + (data.expires_in * 1000),
    };

    return data.access_token;
  }

  async getClaims(veteranId: string): Promise<any> {
    const token = await this.getOAuthToken();

    const response = await fetch(
      `https://api.va.gov/veterans/${veteranId}/claims`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.json();
  }
}
```

---

## Summary

**The OpenAPI spec you found is the RIGHT one to use, but:**
- ❌ Chrome extension can't call it directly (OAuth secrets)
- ✅ Your backend should call it (secure OAuth flow)
- ✅ Extension calls your backend
- ✅ Your backend proxies to VA Lighthouse API

**This is actually BETTER because:**
- More secure
- More control
- Can cache/analyze data
- Follows VA's intended architecture

Ready to implement the backend proxy? 🚀
