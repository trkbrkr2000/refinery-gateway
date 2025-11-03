# VA.gov API Approach (Instead of Scraping)

## Overview

Instead of scraping HTML, we'll use VA.gov's internal `vets-api` which the website itself uses. When a user is logged into VA.gov, their browser has session cookies that authenticate API requests.

---

## How VA.gov Authentication Works

### Session Cookies
- User logs in to VA.gov via ID.me, Login.gov, or DS Logon
- VA.gov sets a session cookie in the browser
- This cookie authenticates all API requests to `api.va.gov`
- Cookie expires after 30 minutes of inactivity

### Chrome Extension Advantage
- Extension runs in the same browser context
- Has access to the same cookies
- Can make authenticated API calls on behalf of the logged-in user
- No need to scrape HTML!

---

## VA.gov API Endpoints

### Base URL
```
https://api.va.gov
```

### Claims Endpoints (Internal vets-api)

**Get All Claims:**
```
GET /v0/evss_claims_async
```

**Get Claim Details:**
```
GET /v0/evss_claims_async/{claimId}
```

**Get Veteran Profile:**
```
GET /v0/profile
```

###Response Format
All endpoints return JSON with veteran claims data, status, evidence, timeline, etc.

---

## Updated Extension Approach

### Old Approach (Scraping)
```javascript
// ❌ Parse HTML DOM
const claims = document.querySelectorAll('.claim-item');
claims.forEach(claim => {
  const id = claim.querySelector('[data-testid="claim-id"]').textContent;
  // ... extract text from HTML
});
```

### New Approach (API)
```javascript
// ✅ Call VA API
const response = await fetch('https://api.va.gov/v0/evss_claims_async', {
  credentials: 'include', // Include session cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
// data.data contains structured claim objects
```

---

## Benefits

### 1. **Reliable**
- HTML can change anytime
- APIs have stable contracts
- Structured JSON data

### 2. **Complete Data**
- Get ALL claim fields
- Not just what's visible on page
- Includes nested objects (evidence, timeline, etc.)

### 3. **Faster**
- No waiting for DOM to load
- Direct API call
- Less processing needed

### 4. **Cleaner Code**
- No complex selectors
- Simple fetch() calls
- Type-safe data structures

---

## Implementation Plan

### Step 1: Update Content Script

Replace scraping logic with API calls:

```typescript
// content.ts
async function getClaimsFromAPI(): Promise<ClaimsData> {
  const response = await fetch('https://api.va.gov/v0/evss_claims_async', {
    method: 'GET',
    credentials: 'include', // Send cookies
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return {
    claims: data.data.map(formatClaim),
    veteranInfo: await getVeteranProfile(),
    scrapedAt: new Date().toISOString(),
  };
}
```

### Step 2: Format API Response

Convert VA API format to our format:

```typescript
function formatClaim(apiClaim: any): Claim {
  return {
    id: apiClaim.id,
    condition: apiClaim.attributes.claimType,
    status: apiClaim.attributes.status,
    filedDate: apiClaim.attributes.dateFiled,
    lastUpdated: apiClaim.attributes.phaseChangeDate,
    evidence: apiClaim.attributes.evss_claim_documents || [],
    timeline: apiClaim.attributes.events_timeline || [],
  };
}
```

### Step 3: Handle Authentication

Check if user is logged in:

```typescript
async function checkAuthentication(): Promise<boolean> {
  try {
    const response = await fetch('https://api.va.gov/v0/user', {
      credentials: 'include'
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

---

## API Response Examples

### Claims Response
```json
{
  "data": [
    {
      "id": "600123456",
      "type": "evss_claims",
      "attributes": {
        "claimId": "600123456",
        "claimType": "Compensation",
        "status": "CLAIM_RECEIVED",
        "dateFiled": "2024-01-15",
        "phaseChangeDate": "2024-03-20",
        "phase": 2,
        "evss_claim_documents": [],
        "events_timeline": [],
        "contentionList": [
          "PTSD (Post Traumatic Stress Disorder)"
        ]
      }
    }
  ]
}
```

### Profile Response
```json
{
  "data": {
    "attributes": {
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "vaFileNumber": "12345678"
      }
    }
  }
}
```

---

## Security Considerations

### ✅ Safe
- Uses existing session cookies
- Same-origin requests (va.gov → api.va.gov)
- No credentials stored by extension
- User must be logged in to VA.gov

### ⚠️ Limitations
- Only works when user is logged into VA.gov
- Session expires after 30 minutes inactivity
- Extension can't "login" - user must login to VA.gov first

---

## Testing Strategy

### 1. **Without VA.gov Account (Mock)**
- Create mock API responses
- Test data formatting
- Test error handling

### 2. **With VA.gov Account (Real)**
- Login to VA.gov
- Extension calls real API
- Verify data matches website

### 3. **Error Cases**
- Not logged in → Show login prompt
- Session expired → Redirect to login
- API error → Display error message

---

## Next Steps

1. ✅ Update `content.ts` to use API instead of scraping
2. ✅ Add API helper functions
3. ✅ Update data types to match VA API response
4. ✅ Test with real VA.gov session
5. ✅ Handle edge cases (not logged in, errors, etc.)

---

## Resources

- VA.gov API GitHub: https://github.com/department-of-veterans-affairs/vets-api
- API Documentation: https://developer.va.gov/
- Claims Status API: `/v0/evss_claims_async`

---

This approach is much more robust and maintainable than HTML scraping!
