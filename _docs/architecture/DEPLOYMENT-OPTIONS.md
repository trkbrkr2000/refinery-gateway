# VA Decision Letter Extraction - Deployment Options

## Overview

The extraction system supports **two modes**:

1. **Regex Mode** (default) - Free, works everywhere, less accurate
2. **AI Mode** (optional) - More accurate, requires Ollama or AI API

---

## Mode 1: Regex Extraction (Free Everywhere)

**Default mode** - No AI required, works on Railway free tier.

### Setup:
```bash
# No environment variables needed - regex is the default
```

### Pros:
- ✅ **100% Free**
- ✅ Works on Railway, Heroku, any platform
- ✅ No external dependencies
- ✅ Fast (milliseconds)

### Cons:
- ❌ Less accurate - may extract some non-medical text
- ❌ Struggles with unusual PDF formats
- ❌ Requires regex tuning for edge cases

---

## Mode 2: AI Extraction (More Accurate)

Uses **Ollama** (local LLM) or AI APIs for intelligent extraction.

### Setup for Ollama (Local):

1. Install Ollama:
```bash
# Mac
brew install ollama

# Linux
curl https://ollama.ai/install.sh | sh
```

2. Pull a model:
```bash
ollama pull llama3.2    # Fast, 2GB
# or
ollama pull qwen2.5     # Better accuracy, 4GB
# or
ollama pull mistral     # Good balance, 4GB
```

3. Start Ollama:
```bash
ollama serve
```

4. Configure your API:
```bash
# .env
USE_AI_EXTRACTION=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### Pros:
- ✅ **Much more accurate**
- ✅ Understands context (ignores policy references)
- ✅ Handles unusual formats better
- ✅ **Still free** if using Ollama locally

### Cons:
- ❌ Requires Ollama installed (local)
- ❌ Slower (5-15 seconds per document)
- ❌ Uses more RAM/CPU

---

## Railway Deployment

### Option A: Regex Only (Simplest)
```bash
# Deploy to Railway - nothing special needed
railway up

# Set in Railway dashboard:
# (no environment variables needed - regex is default)
```

### Option B: Hybrid with External Ollama
```bash
# Deploy API to Railway
railway up

# Set in Railway dashboard:
USE_AI_EXTRACTION=true
OLLAMA_URL=https://your-ollama-server.com  # Point to external Ollama
OLLAMA_MODEL=llama3.2
```

**Where to run external Ollama:**
- Your own VPS (DigitalOcean, Linode, etc.)
- Your home server (with tunneling via Tailscale/ngrok)
- Modal.com (free GPU tier)
- Fly.io (GPU instances)

### Option C: Use Groq API (Free tier available)
```bash
# Alternative: Use Groq's free API instead of Ollama
# Modify extract-with-ai.ts to use Groq's endpoints
# https://console.groq.com/
```

---

## Recommended Deployment Strategy

### **For Development/Testing:**
- Use **AI mode** with local Ollama
- Most accurate results
- Environment: `USE_AI_EXTRACTION=true`

### **For Production (Free):**
- Use **regex mode** on Railway
- Good enough for most cases
- Completely free
- Environment: `USE_AI_EXTRACTION=false` (or omit)

### **For Production (Premium):**
- Deploy API to Railway
- Run Ollama on separate GPU server
- Point Railway app to Ollama URL
- Environment:
  ```
  USE_AI_EXTRACTION=true
  OLLAMA_URL=https://your-ollama-server.com
  ```

---

## How to Switch Modes

The system automatically falls back to regex if AI fails:

```typescript
// AI extraction is attempted first if enabled
if (useAI) {
  try {
    // Try AI extraction
    const aiExtracted = await extractWithAI(fullText);
    // ... use AI results
  } catch (aiError) {
    // If AI fails, fall back to regex
    console.warn('AI failed, using regex fallback');
    // ... use regex results
  }
}
```

---

## Cost Comparison

| Method | Cost/Month | Accuracy | Speed |
|--------|------------|----------|-------|
| **Regex (Railway)** | $0 | 70-80% | <1s |
| **Ollama Local** | $0 | 90-95% | 5-15s |
| **Ollama on VPS** | $5-20 | 90-95% | 5-15s |
| **Groq API (free tier)** | $0 (limited) | 95%+ | 2-5s |
| **OpenAI API** | $10-50 | 95%+ | 2-5s |

---

## Testing Both Modes

```bash
# Test regex mode
USE_AI_EXTRACTION=false npm run start
./test-decision-extraction.sh your-letter.pdf

# Test AI mode (requires Ollama running)
ollama serve &
USE_AI_EXTRACTION=true npm run start
./test-decision-extraction.sh your-letter.pdf
```

---

## Recommended: Start with Regex, Add AI Later

1. **Deploy to Railway with regex** (free, works now)
2. **Collect problem PDFs** where regex fails
3. **Set up Ollama locally** to test
4. **If AI helps significantly**, decide on paid Ollama hosting
5. **Otherwise, improve regex patterns** for those edge cases

This lets you launch quickly and cheaply, then add AI only if needed.
