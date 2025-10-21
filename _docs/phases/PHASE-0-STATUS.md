# Phase 0 Status: Two-Monolith Architecture

## Current State ✅

### 1. Contracts Repository (100% Complete)
**Location:** `contracts/`

✅ JSON Schemas defined
✅ TypeScript types auto-generated
✅ Ready as `@formready/contracts` package

### 2. NestJS Monolith (80% Complete)
**Location:** `api-gateway/`

**Working:**
- ✅ Fastify adapter configured
- ✅ SSE streaming (real-time progress)
- ✅ Documents CRUD endpoints
- ✅ Health/readiness checks
- ✅ CORS enabled

**Needs:**
- ⚠️ Upload handling with multipart
- ⚠️ Redis event bus integration
- ⚠️ Analysis module (Groq LLM stub)
- ⚠️ Export module (PDF generation stub)

### 3. Python Monolith (70% Complete)
**Location:** `refinery-python/`

**Working:**
- ✅ FastAPI structure
- ✅ Routers for extraction, parser, retriever, corpus
- ✅ Event bus abstraction
- ✅ All stub endpoints defined

**Needs:**
- ⚠️ Fix module imports (single-file simplification)
- ⚠️ Redis connection working
- ⚠️ Test all endpoints

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│              FormReady Platform                   │
├──────────────────────────────────────────────────┤
│                                                   │
│  ┌─────────────────────┐   ┌──────────────────┐ │
│  │  NestJS Monolith    │   │ Python Monolith  │ │
│  │  (Port 3000)        │   │ (Port 8000)      │ │
│  ├─────────────────────┤   ├──────────────────┤ │
│  │ • API Gateway       │   │ • Extraction     │ │
│  │ • Upload Handling   │   │ • Parser         │ │
│  │ • Analysis (Groq)   │   │ • Retriever      │ │
│  │ • Export (PDF)      │   │ • Corpus         │ │
│  │ • SSE Streaming     │   │                  │ │
│  └─────────┬───────────┘   └────────┬─────────┘ │
│            │                        │            │
│            └────────┬───────────────┘            │
│                     │                            │
│              ┌──────▼──────┐                     │
│              │    Redis    │                     │
│              │  Event Bus  │                     │
│              └─────────────┘                     │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## Two-Monolith Benefits

1. **Easy Deployment** - 2 services instead of 8+
2. **Shared Code** - Each monolith groups related functionality
3. **Language-Appropriate** - Python for data processing, Node for API/orchestration
4. **Simple Orchestration** - Redis pub/sub between monoliths
5. **Can Split Later** - When we need independent scaling

---

## Event Flow

```
User Upload
   ↓
NestJS: POST /documents/upload
   ↓
emit: document.uploaded → Redis
   ↓
Python: Extraction Service (listens)
   ↓
emit: document.extracted → Redis
   ↓
Python: Parser Service
   ↓
emit: document.spans.ready → Redis
   ↓
Python: Retriever Service
   ↓
emit: document.indexed → Redis
   ↓
NestJS: Analysis Service (Groq LLM)
   ↓
emit: decision.analyzed → Redis
   ↓
NestJS: Export Service (PDF generation)
   ↓
emit: packet.ready → Redis
   ↓
NestJS: SSE → User (real-time updates)
```

---

## Next Steps

### Immediate (Complete Phase 0)

1. **Fix Python Monolith** (30 min)
   - Simplify to single file or fix imports
   - Test all endpoints working
   - Verify Redis connection

2. **Enhance NestJS Monolith** (1 hour)
   - Add upload handling module
   - Add analysis module (Groq stub)
   - Add export module (PDF stub)
   - Wire Redis event listeners

3. **Wire Event Bus** (30 min)
   - Start Redis locally
   - Test event flow end-to-end
   - Verify SSE updates from events

4. **Document & Deploy** (30 min)
   - Create Railway deployment configs
   - Deploy both monoliths
   - Test deployed services

**Total Time:** ~2.5 hours to complete Phase 0

---

## Deployment Plan

### Railway Setup

**Service 1: formready-api (NestJS)**
```bash
cd api-gateway
railway up
railway vars set NODE_ENV=production REDIS_URL=...
```

**Service 2: formready-python (Python)**
```bash
cd refinery-python
railway up
railway vars set REDIS_URL=...
```

**Service 3: Redis**
```bash
railway add redis
```

### Environment Variables

**Both Services Need:**
- `REDIS_URL` - Redis connection string
- `PORT` - Service port (Railway auto-assigns)

**NestJS Also Needs:**
- `PYTHON_API_URL` - URL of Python monolith
- `GROQ_API_KEY` - For LLM calls (Phase 1)

---

## Repository Structure

```
refinery-repos/
├── contracts/                 # ✅ Shared schemas & types
│   ├── schemas/
│   ├── types/typescript/
│   └── package.json
│
├── api-gateway/              # ✅ NestJS Monolith
│   ├── src/
│   │   ├── documents/        # Endpoints
│   │   ├── upload/           # TODO: Add
│   │   ├── analysis/         # TODO: Add
│   │   ├── export/           # TODO: Add
│   │   └── events/           # TODO: Add
│   └── package.json
│
├── refinery-python/          # ⚠️ Python Monolith (needs fix)
│   ├── app/
│   │   ├── main.py
│   │   ├── events.py
│   │   └── routers/
│   ├── requirements.txt
│   └── venv/
│
├── CLAUDE.md                 # Original guide
├── REQUIREMENTS.md           # Full requirements
├── IMPLEMENTATION-ROADMAP.md # Detailed phases
└── PHASE-0-STATUS.md         # This file
```

---

## Success Criteria for Phase 0

- [ ] Python monolith running on port 8000
- [ ] NestJS monolith running on port 3000
- [ ] Redis event bus working
- [ ] Upload document → triggers extraction (stub)
- [ ] Extraction → emits event → triggers parser
- [ ] Full event chain completes
- [ ] SSE shows real-time progress from events
- [ ] Both monoliths deployed to Railway
- [ ] Health endpoints return 200
- [ ] End-to-end stub flow tested

---

## What We Have vs What We Need

### Have ✅
- Contracts with type safety
- API Gateway with SSE
- Python service structure
- Clear event flow design

### Need ⚠️
- Python imports fixed
- Upload handling in NestJS
- Redis wired between services
- Event listeners in both monoliths
- Railway deployment configs

---

## Time Investment So Far

- Contracts: 1 hour ✅
- API Gateway: 1 hour ✅
- Python structure: 1 hour ⚠️
- **Total:** 3 hours

**Remaining:** ~2.5 hours to complete Phase 0

---

## Decision: Two Monoliths is Right

**Why not microservices?**
- Too complex for Phase 0
- Deployment overhead
- More moving parts to debug

**Why not one monolith?**
- Python better for PDF/ML work
- NestJS better for API/orchestration
- Language-appropriate tools

**Why this is perfect:**
- ✅ Simple deployment (2 services + Redis)
- ✅ Clear separation of concerns
- ✅ Can split later if needed
- ✅ Fast local development
- ✅ Production-ready architecture

---

**Status:** On track! Just need to fix Python imports, add a few modules to NestJS, and wire Redis.

**Next Session:** Complete these 4 items above and Phase 0 is DONE! 🎉
