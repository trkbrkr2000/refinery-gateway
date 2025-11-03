# How to Load the Chrome Extension

## Step 1: Build the Extension

```bash
cd refinery-chrome-extension
npm install  # If you haven't already
npm run build
```

This creates the `dist/` folder with all necessary files.

## Step 2: Create Placeholder Icons (if needed)

If you don't have icon files, create simple placeholders:

```bash
cd refinery-chrome-extension/dist/icons

# Create simple colored squares as placeholders
# Or copy any 16x16, 32x32, 48x48, 128x128 PNG images
```

**Quick Fix:** You can also temporarily edit `manifest.json` to remove icon references if you want to test without icons first.

## Step 3: Load Extension into Chrome

1. **Open Chrome Extensions Page:**
   - Open Chrome browser
   - Go to `chrome://extensions/`
   - Or: Menu (3 dots) → Extensions → Manage Extensions

2. **Enable Developer Mode:**
   - Toggle "Developer mode" switch in the top-right corner

3. **Load the Extension:**
   - Click "Load unpacked" button
   - Navigate to: `refinery-chrome-extension/dist` folder
   - Select the folder and click "Select"

4. **Verify Installation:**
   - You should see "ClaimReady VA Tracker" in your extensions list
   - The extension icon should appear in Chrome toolbar (if enabled)

## Step 4: Pin the Extension (Optional)

- Click the puzzle piece icon in Chrome toolbar
- Find "ClaimReady VA Tracker"
- Click the pin icon to keep it visible in toolbar

## Step 5: Test the Extension

1. **Test Login:**
   - Click the extension icon
   - Try logging in with your ClaimReady credentials

2. **Test VA.gov Connection:**
   - Navigate to `https://www.va.gov`
   - Log in to your VA.gov account
   - Click the extension icon again
   - Should detect you're logged in

3. **Test Sync:**
   - Navigate to `https://www.va.gov/track-claims`
   - Click extension icon
   - Click "Sync Now" button
   - Watch the progress

## Troubleshooting

### Extension Won't Load

**Error: "Manifest file is missing or unreadable"**
- Make sure you selected the `dist/` folder (not the parent folder)
- Check that `manifest.json` exists in `dist/`

**Error: "Failed to load extension"**
- Check Chrome console: View → Developer → Developer Tools
- Look for error messages in the console
- Common issues:
  - Missing files referenced in manifest
  - Syntax errors in JavaScript files
  - Invalid manifest.json

### Extension Icon Missing

- The extension will still work without icons
- Create placeholder icons or comment out icon references in manifest

### Content Script Not Working

- Make sure you're on `https://www.va.gov/*` (not `http://`)
- Check browser console (F12) for errors
- Look for errors in extension service worker (chrome://extensions → service worker link)

### API Connection Issues

**CORS Errors:**
- Make sure API server is running
- Check API URL in extension (dev vs prod)
- Verify CORS is configured on API server

**Authentication Errors:**
- Check that you're logged into ClaimReady
- Verify token is being stored: `chrome.storage.local` in DevTools
- Check API logs for authentication issues

## Development Mode

To use development API:

1. Open extension popup
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run: `chrome.storage.local.set({extension_dev_mode: true})`
5. Reload extension

This will use `http://localhost:3001/api/v1` instead of production API.

## Checking Extension Logs

**View Extension Console:**
- Go to `chrome://extensions/`
- Find your extension
- Click "service worker" link (if available) for background script logs
- Or: Right-click extension icon → "Inspect popup" for popup logs

**View Content Script Logs:**
- Navigate to VA.gov page
- Press F12 to open DevTools
- Console tab shows content script logs

## Next Steps

Once loaded:
1. ✅ Extension appears in Chrome toolbar
2. ✅ Login works with ClaimReady credentials
3. ✅ Can detect VA.gov login
4. ✅ Can scrape and sync claims data

