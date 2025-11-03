# Quick Start - Get Extension Working in Chrome

## 🚀 Fast Setup (3 Steps)

### 1. Build the Extension
```bash
cd refinery-chrome-extension
npm install
npm run build
```

### 2. Load in Chrome
1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `refinery-chrome-extension/dist` folder

### 3. Create Icons (Optional)
The extension works without icons, but Chrome may show warnings.

**Option A - Use any PNG images:**
- Create or download 4 PNG files:
  - `icon-16.png` (16x16 pixels)
  - `icon-32.png` (32x32 pixels)
  - `icon-48.png` (48x48 pixels)
  - `icon-128.png` (128x128 pixels)
- Place them in `refinery-chrome-extension/dist/icons/`

**Option B - Use online icon generator:**
- Go to https://www.favicon-generator.org/ or similar
- Upload any image
- Download all sizes
- Place in `dist/icons/`

**Option C - Skip icons (for testing):**
- Edit `dist/manifest.json`
- Remove or comment out the `icons` and `default_icon` sections
- Reload extension

## ✅ Verify It's Working

1. **See the Extension:**
   - Extension icon should appear in Chrome toolbar
   - If not visible, click puzzle piece icon → pin it

2. **Open the Popup:**
   - Click extension icon
   - Should see login screen

3. **Check Console (if issues):**
   - Right-click extension icon → "Inspect popup"
   - Check Console tab for errors

## 🔧 Common Issues

**"Manifest file is missing"**
→ Make sure you selected the `dist/` folder, not parent folder

**"Failed to load extension"**
→ Check browser console for errors

**Extension doesn't appear**
→ Click puzzle piece (🧩) icon in toolbar to find it

**Icons missing**
→ Extension still works, just add placeholder icons or remove icon references from manifest

## 📝 What to Test

1. ✅ Extension loads without errors
2. ✅ Popup opens when clicking icon
3. ✅ Login form appears
4. ✅ Can navigate to VA.gov
5. ✅ Extension detects VA.gov pages

Once these work, you're ready to test the full flow!

