# ClaimReady Chrome Extension

Chrome extension for syncing VA.gov claims data with ClaimReady for analysis and review.

## 🚀 Quick Start

### 1. Build
```bash
npm install
npm run build
```

### 2. Load in Chrome
1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder

### 3. Use
1. Click extension icon
2. Login to ClaimReady
3. Navigate to VA.gov and login
4. Click "Sync Now" to extract and sync claims

## 📁 Project Structure

```
refinery-chrome-extension/
├── src/
│   ├── popup.ts          # Main popup UI logic
│   ├── content.ts        # VA.gov scraping logic
│   └── background.ts     # Service worker
├── dist/                 # Built files (load this in Chrome)
├── popup.html            # Popup HTML
├── popup.css             # Popup styles
├── content.css           # Content script styles
├── manifest.json         # Extension manifest
└── package.json          # Build configuration
```

## 🛠️ Development

**Watch mode:**
```bash
npm run dev
```

**Clean build:**
```bash
npm run clean
npm run build
```

## 📝 Features

- ✅ ClaimReady authentication
- ✅ VA.gov login detection
- ✅ Automatic claims data extraction
- ✅ Sync to ClaimReady API
- ✅ Progress tracking
- ✅ Error handling

## 🔧 Configuration

**Development API:**
- Set `extension_dev_mode: true` in `chrome.storage.local`
- Uses `http://localhost:3001/api/v1`

**Production API:**
- Uses `https://api.claimready.io/api/v1`

## 📚 Documentation

- [Quick Start Guide](./QUICK-START.md)
- [Detailed Loading Instructions](./LOAD-INTO-CHROME.md)
- [Implementation Details](./IMPLEMENTATION.md)

## 🐛 Troubleshooting

See [LOAD-INTO-CHROME.md](./LOAD-INTO-CHROME.md) for common issues and solutions.

