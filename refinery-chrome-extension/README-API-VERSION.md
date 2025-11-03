# Chrome Extension - API Version ✅

## What Changed: Using VA.gov API Instead of Scraping

The extension now uses VA.gov's internal API (`api.va.gov`) to fetch claims data instead of scraping HTML from the website.

---

## How It Works

### Before (Scraping)
```javascript
// ❌ Parse HTML DOM elements
const claims = document.querySelectorAll('.claim-item');
// Fragile, breaks when HTML changes
```

### After (API)
```javascript
// ✅ Call VA.gov API directly
const response = await fetch('https://api.va.gov/v0/evss_claims_async', {
  credentials: 'include' // Uses user's session cookies
});
const claims = await response.json();
// Reliable, structured JSON data
```

---

## Benefits

### ✅ **More Reliable**
- API has stable contract
- Won't break when HTML changes
- Structured JSON responses

### ✅ **Complete Data**
- Get ALL claim information
- Not just what's visible on screen
- Includes evidence, timeline, detailed status

### ✅ **Faster**
- Direct API calls
- No DOM parsing needed
- Less processing required

### ✅ **Cleaner Code**
- No complex selectors
- Type-safe interfaces
- Better error handling

---

## VA.gov API Endpoints Used

### 1. Authentication Check
```
GET https://api.va.gov/v0/user
```
Checks if user is logged into VA.gov

### 2. Fetch Claims
```
GET https://api.va.gov/v0/evss_claims_async
```
Returns array of all user's claims (open and closed)

### 3. Veteran Profile
```
GET https://api.va.gov/v0/profile
```
Returns veteran's name, VA file number, etc.

---

## How Authentication Works

### User Logs Into VA.gov
1. User goes to VA.gov
2. Logs in with ID.me, Login.gov, or DS Logon
3. VA.gov sets session cookies
4. Cookies are valid for 30 minutes

### Extension Uses Session
1. Extension runs in same browser context
2. Has access to same cookies (via `credentials: 'include'`)
3. Makes authenticated API calls
4. No need to store credentials!

---

## Loading & Testing

### Step 1: Load Extension
```
1. chrome://extensions/
2. Enable "Developer mode"
3. Load unpacked → select dist/
```

### Step 2: Login to VA.gov
```
1. Go to https://www.va.gov
2. Click "Sign in"
3. Login with your credentials
4. Navigate to Track Claims page
```

### Step 3: Test Extension
```
1. Click extension icon
2. Extension checks VA.gov authentication
3. Fetches claims data via API
4. Displays in popup
```

### Step 4: Verify API Calls (DevTools)
```
1. Open VA.gov page
2. Press F12 → Console tab
3. Run: chrome.runtime.sendMessage({action: 'fetchClaims'}, console.log)
4. Check console for claims data
```

---

## API Response Format

### Claims Response
```json
{
  "data": [
    {
      "id": "600123456",
      "type": "evss_claims",
      "attributes": {
        "claimId": "600123456",
        "status": "CLAIM_RECEIVED",
        "dateFiled": "2024-01-15",
        "phaseChangeDate": "2024-03-20",
        "contentionList": [
          "PTSD (Post Traumatic Stress Disorder)"
        ],
        "evss_claim_documents": [],
        "events_timeline": []
      }
    }
  ]
}
```

### Our Formatted Version
```json
{
  "claims": [
    {
      "id": "600123456",
      "condition": "PTSD (Post Traumatic Stress Disorder)",
      "status": "Claim Received",
      "filedDate": "2024-01-15",
      "lastUpdated": "2024-03-20",
      "evidence": [],
      "timeline": []
    }
  ],
  "veteranInfo": {
    "name": "John Doe",
    "vaFileNumber": "12345678",
    "ssn": "***-**-6789"
  },
  "fetchedAt": "2024-11-02T..."
}
```

---

## Files Changed

### New Files
- ✅ `src/types.ts` - Shared TypeScript interfaces
- ✅ `manifest.json` - Added `https://api.va.gov/*` permission
- ✅ `API-APPROACH.md` - Technical documentation

### Updated Files
- ✅ `src/content.ts` - Now uses API instead of scraping
- ✅ Built files in `dist/` - Ready to load

### Backup Files
- ✅ `src/content-scraper.ts.backup` - Old scraping version (just in case)

---

## Troubleshooting

### "Not authenticated" Error
**Problem:** Extension says user not authenticated
**Solution:** Login to VA.gov first, then retry

### "Failed to fetch claims" Error
**Problem:** API call failed
**Solution:**
- Check you're logged into VA.gov
- Session may have expired (30 min timeout)
- Reload VA.gov page and try again

### CORS Errors
**Problem:** Cross-origin request blocked
**Solution:**
- Extension runs on `www.va.gov` pages
- Has permission for `api.va.gov`
- Should not get CORS errors (same-origin policy)

### No Data Returned
**Problem:** API returns empty claims array
**Solution:**
- User may not have any claims
- Check on VA.gov website directly
- Try different VA.gov page (track-claims)

---

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Login to VA.gov works
- [ ] Extension icon shows in toolbar
- [ ] Click extension → Shows login status
- [ ] Console shows "User is authenticated"
- [ ] Claims data fetched successfully
- [ ] Veteran info displays correctly
- [ ] No errors in console

---

## Next Steps

Once VA.gov API integration is confirmed working:

1. ✅ Verify claims data matches VA.gov website
2. ⏸️ Connect to ClaimReady backend API
3. ⏸️ Store claims in ClaimReady database
4. ⏸️ Show sync status in popup
5. ⏸️ Handle edge cases (expired session, API errors)

---

## Resources

- **VA.gov API Docs:** https://developer.va.gov/
- **VA.gov GitHub:** https://github.com/department-of-veterans-affairs/vets-api
- **Claims API:** `/v0/evss_claims_async`
- **Profile API:** `/v0/profile`

---

**Status:** ✅ **Extension rebuilt with API approach and ready to test!**

Just load into Chrome and login to VA.gov to test.
