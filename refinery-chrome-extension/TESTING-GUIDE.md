# Chrome Extension Testing Guide

## Focus: Testing VA.gov Data Extraction

This guide focuses on testing the Chrome extension's ability to scrape VA.gov claims data. We'll skip the ClaimReady sync for now.

---

## Step 1: Load Extension in Chrome

### 1.1 Build the Extension (Already Done ✅)
```bash
cd refinery-chrome-extension
npm install
npm run build
```

### 1.2 Load into Chrome
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right)
4. Click **"Load unpacked"**
5. Select folder: `refinery-repos/refinery-chrome-extension/dist/`
6. Extension should appear as "ClaimReady VA Tracker"

### 1.3 Pin the Extension (Optional)
- Click puzzle piece icon in Chrome toolbar
- Find "ClaimReady VA Tracker"
- Click pin icon to keep it visible

---

## Step 2: Test Data Extraction

### Option A: Test on Real VA.gov (Requires Login)

**If you have VA.gov credentials:**

1. **Navigate to VA.gov:**
   - Go to `https://www.va.gov/track-claims`
   - Login with your VA.gov credentials (ID.me, Login.gov, etc.)

2. **Open Browser Console:**
   - Press `F12` (or Right-click → Inspect)
   - Go to **Console** tab

3. **Test Content Script:**
   - The extension's content script should auto-load on VA.gov pages
   - Look for console messages from the extension
   - Messages will show "VA.gov Scraper initialized" or similar

4. **Manually Trigger Scraping:**
   - In console, type:
   ```javascript
   chrome.runtime.sendMessage({action: 'scrapeClaims'}, (response) => {
     console.log('Scraped data:', response);
   });
   ```

5. **Check Scraped Data:**
   - Console will show extracted claims data
   - Look for: claim IDs, conditions, statuses, dates

---

### Option B: Test on Mock VA.gov Page (No Login Required)

**Create a local test page that mimics VA.gov structure:**

We can create a simple HTML page with mock claim data that the extension can scrape.

#### 2.1 Create Mock Test Page

Create file: `refinery-chrome-extension/test-va-page.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mock VA.gov Claims - Test Page</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .claim-item { border: 1px solid #ccc; padding: 15px; margin: 10px 0; }
    .claim-status { font-weight: bold; color: #0066cc; }
  </style>
</head>
<body>
  <h1>Your VA Claims and Appeals</h1>
  <div id="claimsContainer">
    <!-- Claim 1 -->
    <div class="claim-item" data-testid="claim-item-1">
      <h3 data-testid="claim-condition">PTSD (Post Traumatic Stress Disorder)</h3>
      <p class="claim-status">Status: <span data-testid="claim-status">Under Review</span></p>
      <p>Claim ID: <span data-testid="claim-id">123456</span></p>
      <p>Filed: <span data-testid="claim-filed">January 15, 2024</span></p>
      <p>Last Updated: <span data-testid="claim-updated">March 20, 2024</span></p>
    </div>

    <!-- Claim 2 -->
    <div class="claim-item" data-testid="claim-item-2">
      <h3 data-testid="claim-condition">Tinnitus</h3>
      <p class="claim-status">Status: <span data-testid="claim-status">Pending Decision</span></p>
      <p>Claim ID: <span data-testid="claim-id">123457</span></p>
      <p>Filed: <span data-testid="claim-filed">February 10, 2024</span></p>
      <p>Last Updated: <span data-testid="claim-updated">March 25, 2024</span></p>
    </div>

    <!-- Claim 3 -->
    <div class="claim-item" data-testid="claim-item-3">
      <h3 data-testid="claim-condition">Knee Injury</h3>
      <p class="claim-status">Status: <span data-testid="claim-status">Evidence Needed</span></p>
      <p>Claim ID: <span data-testid="claim-id">123458</span></p>
      <p>Filed: <span data-testid="claim-filed">December 5, 2023</span></p>
      <p>Last Updated: <span data-testid="claim-updated">March 15, 2024</span></p>
    </div>
  </div>

  <div style="margin-top: 30px; padding: 20px; background: #f0f0f0;">
    <h2>Veteran Information</h2>
    <p>Name: <span id="veteranName">John Doe</span></p>
    <p>VA File Number: <span id="vaFileNumber">12345678</span></p>
  </div>
</body>
</html>
```

#### 2.2 Update Extension Permissions

We need to allow the extension to run on local files:

1. Go to `chrome://extensions/`
2. Find "ClaimReady VA Tracker"
3. Click **Details**
4. Scroll down to "Allow access to file URLs"
5. **Enable** the toggle

#### 2.3 Update manifest.json for local testing

Add local file permissions to `manifest.json`:

```json
"content_scripts": [
  {
    "matches": [
      "https://www.va.gov/*",
      "file:///*test-va-page.html"
    ],
    "js": ["content.js"],
    "css": ["content.css"]
  }
]
```

#### 2.4 Test with Mock Page

1. **Open the test page:**
   - File → Open File
   - Select `test-va-page.html`
   - Or drag file into Chrome

2. **Open Console (F12)**

3. **Trigger scraping:**
   ```javascript
   chrome.runtime.sendMessage({action: 'scrapeClaims'}, (response) => {
     console.log('Scraped data:', response.data);
   });
   ```

4. **Verify extracted data:**
   ```javascript
   // Should see:
   {
     "claims": [
       {
         "id": "123456",
         "condition": "PTSD",
         "status": "Under Review",
         "filedDate": "January 15, 2024",
         "lastUpdated": "March 20, 2024"
       },
       // ... more claims
     ],
     "veteranInfo": {
       "name": "John Doe",
       "vaFileNumber": "12345678"
     }
   }
   ```

---

## Step 3: Debugging the Extension

### View Extension Logs

**Background Service Worker Logs:**
1. Go to `chrome://extensions/`
2. Find "ClaimReady VA Tracker"
3. Click "service worker" link
4. Opens DevTools for background script

**Content Script Logs:**
1. On VA.gov page (or test page)
2. Press F12
3. Console tab shows content script logs

**Popup Logs:**
1. Right-click extension icon
2. Select "Inspect popup"
3. DevTools opens for popup

### Common Issues

**Extension doesn't load:**
- Check manifest.json is valid
- Look for errors in `chrome://extensions/`
- Click "Errors" button if present

**Content script not running:**
- Verify you're on `https://www.va.gov/*` (or test page)
- Check content script matches in manifest
- Look for console errors

**No data scraped:**
- VA.gov page structure may have changed
- Check if selectors in `content.ts` match page elements
- Use Chrome DevTools to inspect page elements

---

## Step 4: Inspect the Scraping Logic

### View Content Script Source

1. Open `refinery-chrome-extension/src/content.ts`
2. Look for `scrapeClaimsData()` function
3. Check selectors used:
   ```typescript
   [data-testid*="claim"]
   .claim-item
   .claim-row
   ```

### Test Selectors Manually

On VA.gov page, test selectors in console:

```javascript
// Find claim elements
document.querySelectorAll('[data-testid*="claim"]');
document.querySelectorAll('.claim-item');

// Check what's found
console.log('Found claims:',
  document.querySelectorAll('[data-testid*="claim"]').length
);
```

### Modify Selectors if Needed

If VA.gov uses different selectors:

1. Inspect elements on real VA.gov
2. Update selectors in `src/content.ts`
3. Rebuild: `npm run build`
4. Reload extension in Chrome

---

## Step 5: Test Workflow (Without ClaimReady Sync)

### Manual Test Flow:

1. ✅ **Load extension** → Should see in Chrome extensions
2. ✅ **Navigate to VA.gov** (or test page)
3. ✅ **Content script loads** → Check console for messages
4. ✅ **Data scrapes successfully** → Verify in console
5. ⏸️ **Sync to ClaimReady** → Skip for now

### What We're Testing:

- [x] Extension installs correctly
- [x] Content script runs on VA.gov pages
- [x] Claims data is extracted from DOM
- [x] Veteran info is extracted
- [x] Data structure matches expected format
- [ ] ~~Sync to ClaimReady API~~ (Later)

---

## Next Steps (After VA.gov Scraping Works)

1. **Add console logging** to see exactly what's scraped
2. **Test on real VA.gov** with actual claims
3. **Refine selectors** based on real page structure
4. **Add error handling** for missing data
5. **Then** implement ClaimReady sync

---

## Quick Test Commands

```javascript
// In browser console on VA.gov page:

// 1. Check if content script loaded
console.log('Extension active:', !!chrome.runtime?.id);

// 2. Trigger scraping
chrome.runtime.sendMessage({action: 'scrapeClaims'}, (response) => {
  console.log('Result:', response);
});

// 3. Check auth status
chrome.runtime.sendMessage({action: 'checkVaAuth'}, (response) => {
  console.log('Authenticated:', response.authenticated);
});
```

---

## Success Criteria ✅

- [ ] Extension loads without errors
- [ ] Content script runs on VA.gov pages
- [ ] Console shows scraped claim data
- [ ] Data includes: claim IDs, conditions, statuses, dates
- [ ] Veteran info extracted
- [ ] No JavaScript errors in console

Once these work, we'll tackle the ClaimReady API sync!
