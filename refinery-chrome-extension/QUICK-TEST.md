# Quick Test - Chrome Extension VA.gov Scraping

## 5-Minute Quick Start

### Step 1: Load Extension (2 min)
```bash
# Extension is already built! Just load it:
```

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Select: `refinery-repos/refinery-chrome-extension/dist/`

✅ Extension should appear as "ClaimReady VA Tracker"

### Step 2: Test with Mock Page (3 min)

1. **Enable file access:**
   - In `chrome://extensions/`
   - Find "ClaimReady VA Tracker" → click "Details"
   - Enable "Allow access to file URLs"

2. **Open test page:**
   - Drag `test-va-page.html` into Chrome
   - Or File → Open File → select `test-va-page.html`

3. **Click "Test Scraping" button**
   - Or press F12 and run in console:
   ```javascript
   chrome.runtime.sendMessage({action: 'scrapeClaims'}, (r) => console.log(r));
   ```

4. **Check console (F12)**
   - Should see: "✅ Scraping successful!"
   - Should show 4 claims extracted

---

## What You Should See

### Expected Console Output:
```javascript
{
  "success": true,
  "data": {
    "claims": [
      {
        "id": "600123456",
        "condition": "PTSD",
        "status": "Under Review",
        "filedDate": "January 15, 2024",
        "lastUpdated": "March 20, 2024"
      },
      // ... 3 more claims
    ],
    "veteranInfo": {
      "name": "John A. Doe",
      "vaFileNumber": "12345678",
      "ssn": "***-**-6789"
    },
    "scrapedAt": "2024-11-02T..."
  }
}
```

---

## Troubleshooting

**Extension won't load:**
- Check you selected the `dist/` folder (not parent folder)
- Look for errors at `chrome://extensions/`

**No data scraped:**
- Check console for errors (F12)
- Verify extension has file access enabled
- Try reloading the test page

**"Chrome.runtime undefined":**
- Extension not loaded properly
- Reload extension at `chrome://extensions/`

---

## Next: Test on Real VA.gov

Once mock page works:

1. Navigate to `https://www.va.gov/track-claims`
2. Login with VA.gov credentials
3. Open console (F12)
4. Run: `chrome.runtime.sendMessage({action: 'scrapeClaims'}, console.log);`
5. Check if real claims are extracted

---

## Files Created

- ✅ `dist/` - Built extension (ready to load)
- ✅ `test-va-page.html` - Mock VA.gov page
- ✅ `TESTING-GUIDE.md` - Full testing documentation
- ✅ `QUICK-TEST.md` - This file

---

## Success Checklist

- [ ] Extension loaded in Chrome
- [ ] Test page opens without errors
- [ ] "Test Scraping" button works
- [ ] Console shows 4 claims extracted
- [ ] Veteran info includes name and file number

**Once these work → Ready to test on real VA.gov!**
