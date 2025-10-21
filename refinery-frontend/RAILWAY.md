# Railway Deployment Guide - Nuxt Frontend

This is a **Nuxt 3 + Vue 3** application configured for Railway deployment.

## 🚀 Quick Deploy

1. **Connect Repository** to Railway
2. **Select Root Directory**: `refinery-frontend`
3. **Framework Detection**: Railway will detect Nuxt (or use Dockerfile/nixpacks.toml)

## 📋 Required Environment Variables

Set these in Railway dashboard:

```bash
# API Configuration
NUXT_PUBLIC_API_URL=https://your-api-domain.railway.app/api/v1

# Firebase Configuration (if needed)
NUXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NUXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## 🔧 Build Configuration

Railway will use one of these (in order of preference):

### 1. Dockerfile (Recommended)
- Multi-stage build for optimized image size
- Node 20 Alpine base
- Builds to `.output/` directory

### 2. nixpacks.toml
- Alternative to Dockerfile
- Same Node 20 runtime
- Faster for simple deployments

### 3. Auto-detection
- Railway will detect `package.json` and use Nuxt buildpack

## 📦 Build Output

Nuxt builds to `.output/` directory:
- Server code: `.output/server/index.mjs`
- Client assets: `.output/public/`

## 🌐 Production Start Command

```bash
node .output/server/index.mjs
```

Railway automatically sets `PORT` environment variable.

## ✅ Verification

After deployment:

1. Check build logs for errors
2. Visit deployment URL
3. Test routing and API calls
4. Verify environment variables loaded

## 🛠️ Local Development

```bash
npm install
npm run dev
```

Runs on http://localhost:3000

## 📚 Tech Stack

- **Framework**: Nuxt 3
- **UI**: Vue 3 + Tailwind CSS
- **State**: Pinia
- **Node**: 20.x
- **Package Manager**: npm

## 🐛 Troubleshooting

### Railway detects as Angular
- **Solution**: Use Dockerfile or nixpacks.toml (already configured)

### Build fails
- Check Node version (should be 20.x)
- Verify all dependencies in package.json
- Check build logs for specific errors

### Runtime errors
- Verify NUXT_PUBLIC_API_URL is set correctly
- Check that API is deployed and accessible
- Inspect deployment logs

## 📝 Notes

- SSR enabled by default
- Nitro preset: `node-server`
- TypeScript strict mode disabled for faster builds
- Dev server runs on port 3000 (configurable)
