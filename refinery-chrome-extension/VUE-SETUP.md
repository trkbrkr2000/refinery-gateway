# Vue.js Setup for Chrome Extension

Yes, **you can absolutely use Vue.js** in Chrome extensions! Here's how to set it up.

## Option 1: Simple Vue (Recommended for Extensions)

This uses Vue via CDN or bundled, which is simpler for extensions:

### Setup Steps

1. **Install Vue 3:**
```bash
cd refinery-chrome-extension
npm install vue@^3
```

2. **Install Vite** (for bundling):
```bash
npm install -D vite @vitejs/plugin-vue
```

3. **Create `vite.config.ts`:**
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
```

4. **Convert `popup.html` to use Vue:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ClaimReady VA Tracker</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./src/popup.ts"></script>
</body>
</html>
```

5. **Convert `src/popup.ts` to Vue component:**
```typescript
import { createApp } from 'vue';
import PopupApp from './popup.vue';

createApp(PopupApp).mount('#app');
```

6. **Create `src/popup.vue`:**
```vue
<template>
  <div class="popup-container">
    <div class="header">
      <h1>ClaimReady VA Tracker</h1>
      <div class="status-indicator">
        <div :class="['status-dot', isConnected ? 'connected' : 'disconnected']"></div>
        <span>{{ isConnected ? 'Connected' : 'Not Connected' }}</span>
      </div>
    </div>
    
    <div class="content">
      <button @click="startSync" :disabled="isSyncing">
        {{ isSyncing ? 'Syncing...' : 'Sync Now' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isConnected = ref(false);
const isSyncing = ref(false);

onMounted(async () => {
  // Your initialization logic here
});

const startSync = async () => {
  // Your sync logic here
};
</script>

<style scoped>
.popup-container {
  width: 350px;
  padding: 16px;
}
</style>
```

7. **Update `package.json` scripts:**
```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "preview": "vite preview"
  }
}
```

## Option 2: Nuxt (More Complex)

Since you already use Nuxt in `refinery-formready`, you could use a Nuxt module, but this is overkill for a simple extension popup.

## Recommendation

**Use Option 1 (Simple Vue)** because:
- ✅ Extensions are simple UIs (popup, options page)
- ✅ Smaller bundle size
- ✅ Faster build times
- ✅ Easier debugging
- ✅ Vue 3 Composition API works great

## Build & Load Extension

1. **Build:**
```bash
npm run build
```

2. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `refinery-chrome-extension` folder

## Important Notes

- **Content Scripts** (`content.ts`) should remain vanilla TS/JS (no Vue)
- **Background Service Workers** can use Vue if needed, but vanilla is simpler
- **Popup/Options pages** are perfect for Vue
- Manifest v3 requires service workers (no DOM), so Vue won't work in background scripts

Would you like me to convert the current extension to use Vue?

