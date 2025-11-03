# Chrome Extension Implementation

## Overview

The Chrome extension enables users to:
1. **Login to ClaimReady** - Authenticate with their ClaimReady account
2. **Login to VA.gov** - Navigate to VA.gov and sign in
3. **Extract Claims Data** - Automatically scrape claims information from VA.gov
4. **Sync to ClaimReady** - Push data to ClaimReady API for analysis and review

## Complete Flow

### 1. User Authentication (ClaimReady)

**Login Screen:**
- User enters email and password in extension popup
- Extension calls `/api/v1/auth/login` endpoint
- Receives JWT token and stores it securely in `chrome.storage.local`
- User data (userId, email, name, etc.) is stored for display

**Logout:**
- Clears stored token and user data
- Returns to login screen

### 2. VA.gov Connection

**Detection:**
- Extension checks if user is on VA.gov website
- Verifies user is logged into VA.gov by:
  - Looking for user profile/menu elements
  - Checking for claims page content
  - Detecting absence of sign-in links

### 3. Data Extraction

**Content Script (`content.ts`):**
- Runs on all VA.gov pages
- Waits for page to load (1 second delay for dynamic content)
- Scrapes claims using multiple selector strategies:
  - Data-testid attributes (`[data-testid*="claim"]`)
  - Class selectors (`.claim-item`, `.claim-row`)
  - Table rows with claim data
  - Text-based fallback extraction

**Data Extracted:**
- Claim ID
- Condition/Disability
- Status (Pending, Under Review, Denied, etc.)
- Filed Date
- Last Updated Date
- Evidence submitted
- Timeline/History

**Veteran Information:**
- Name
- VA File Number
- SSN (if available)

### 4. Sync to ClaimReady

**API Endpoint:** `POST /api/v1/chrome-extension/sync`

**Request:**
```json
{
  "claims": [
    {
      "id": "claim-123",
      "condition": "PTSD",
      "status": "Under Review",
      "filedDate": "01/15/2024",
      "lastUpdated": "03/20/2024",
      "evidence": [...],
      "timeline": [...]
    }
  ],
  "veteranInfo": {
    "name": "John Doe",
    "vaFileNumber": "12345678",
    "ssn": "***-**-1234"
  },
  "lastSync": "2024-03-20T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully synced 3 claims for analysis",
  "syncedAt": "2024-03-20T12:00:00Z",
  "claimsCount": 3,
  "userId": "user-123",
  "claims": [...],
  "analysisUrl": "https://claimready.io/dashboard/claims?synced=..."
}
```

### 5. Analysis & Review

**Data Processing:**
- Claims data is formatted into document-like structure
- Prepared for analysis pipeline
- Stored with user association

**Analysis Features:**
- Condition analysis
- Evidence gap identification
- CFR regulation references
- Next steps recommendations
- Denial reason analysis (if applicable)

## File Structure

```
refinery-chrome-extension/
├── src/
│   ├── popup.ts          # Main popup logic (login, sync, UI)
│   ├── content.ts        # VA.gov scraping logic
│   └── background.ts     # Service worker
├── popup.html            # Popup UI
├── manifest.json         # Extension configuration
└── package.json          # Build scripts

refinery-api/
└── src/
    └── chrome-extension/
        ├── chrome-extension.controller.ts  # API endpoint
        ├── chrome-extension.service.ts      # Business logic
        ├── chrome-extension.module.ts       # NestJS module
        └── dto/
            └── sync-claims.dto.ts          # Data validation
```

## API Configuration

**Development:**
- API URL: `http://localhost:3001/api/v1`
- Set `extension_dev_mode: true` in chrome.storage.local

**Production:**
- API URL: `https://api.claimready.io/api/v1`
- Default configuration

## Security

1. **Token Storage:**
   - JWT tokens stored in `chrome.storage.local` (encrypted by Chrome)
   - Never logged or exposed in console

2. **CORS:**
   - API configured to accept requests from Chrome extensions
   - Bearer token authentication required

3. **Data Privacy:**
   - SSN and sensitive data handled securely
   - User association ensures data isolation

## Building & Loading

### Build Extension:
```bash
cd refinery-chrome-extension
npm run build
```

### Load in Chrome:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `refinery-chrome-extension/dist` folder

### Development:
```bash
npm run dev  # Watch mode for development
```

## Testing the Flow

1. **Install Extension** - Load from `dist/` folder
2. **Login to ClaimReady** - Use extension popup to sign in
3. **Navigate to VA.gov** - Go to `https://www.va.gov/track-claims`
4. **Login to VA.gov** - Sign in with VA credentials
5. **Open Extension** - Click extension icon
6. **Sync Now** - Click "Sync Now" button
7. **View in ClaimReady** - Check dashboard for synced claims

## Known Limitations

1. **VA.gov Structure Changes:**
   - Selectors may break if VA.gov updates their HTML
   - Text-based fallback helps but may be less accurate

2. **Dynamic Content:**
   - Some claims may load via JavaScript after page load
   - 1-second delay may not be enough for all cases

3. **Authentication Detection:**
   - Relies on DOM elements which can change
   - May have false positives/negatives

## Future Enhancements

1. **Real-time Sync:**
   - Watch for changes on VA.gov pages
   - Auto-sync when new data detected

2. **Better Extraction:**
   - Use AI/ML for smarter data extraction
   - Handle more claim types and formats

3. **Analysis Integration:**
   - Trigger immediate analysis after sync
   - Show analysis results in extension popup

4. **Notifications:**
   - Alert user when claims status changes
   - Notify about missing evidence

5. **Database Storage:**
   - Proper MongoDB schema for claims
   - Historical tracking of claim changes

