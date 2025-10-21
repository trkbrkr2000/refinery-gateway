# FormReady Architecture
## Two-Service Design

Last Updated: October 19, 2025

---

## Overview

FormReady uses a **two-service architecture** optimized for deployment simplicity and language-appropriate functionality:

1. **refinery-api** (NestJS/TypeScript) - API Gateway & Orchestration
2. **refinery-python** (FastAPI/Python) - PDF Processing & ML

---

## Service Details

### 1. refinery-api (Port: 3001)

**Technology:** NestJS, TypeScript, Express
**Purpose:** Main API gateway, business logic, and orchestration

**Modules:**
- ✅ `auth/` - Authentication & authorization
- ✅ `forms/` - VA form generation (pdf-lib)
- ✅ `va-knowledge/` - VA regulations interface
- ✅ `pipelines/` - Workflow orchestration
- ✅ `queues/` - Job processing (BullMQ)
- ✅ `storage/` - S3 integration
- ✅ `redis/` - Event bus
- ✅ `database/` - MongoDB connection

**Endpoints:**
- `POST /api/forms/{formId}/generate` - Generate filled PDF
- `GET /api/docs` - Swagger documentation
- `POST /api/pipelines` - Create processing pipeline
- Authentication endpoints
- Form management endpoints

**Already Built:**
- ✅ Complete authentication system
- ✅ PDF form filling with pdf-lib
- ✅ Pipeline execution framework
- ✅ Queue management
- ✅ S3 storage integration

---

### 2. refinery-python (Port: 8000)

**Technology:** FastAPI, Python
**Purpose:** Heavy PDF processing, OCR, ML/LLM work

**Endpoints:**

**Extraction:**
- `POST /extraction/extract` - Extract text from PDF
- `GET /extraction/status/{id}` - Get extraction status

**Parser:**
- `POST /parser/parse` - Parse document sections (will use Ollama)

**Retriever:**
- `POST /retriever/retrieve` - Search VA regulations
- `POST /retriever/index/{id}` - Index document

**Corpus:**
- `POST /corpus/ingest` - Ingest VA regulations
- `GET /corpus/status` - Get corpus status

**Health:**
- `GET /health` - Health check
- `GET /` - Service info

**Current State:**
- ✅ Single-file FastAPI app
- ✅ All stub endpoints working
- ✅ Redis event bus integrated
- ✅ Ready for Phase 1 implementation

---

## Event Flow

```
User → refinery-api → Redis → refinery-python
                  ↓                ↓
                Queue            Process
                  ↓                ↓
              Process          Emit Events
                  ↓                ↓
            Emit Events       Redis
                  ↓                ↓
              Listen         refinery-api
                  ↓                ↓
            Next Step          Continue
```

### Event Types

**Emitted by refinery-python:**
- `document.extracted` - Text extraction complete
- `document.spans.ready` - Section parsing complete
- `document.indexed` - Document indexed for search

**Emitted by refinery-api:**
- `document.uploaded` - Document uploaded to S3
- `decision.analyzed` - LLM analysis complete
- `packet.ready` - Final packet generated

---

## Data Flow Example

### 1. User Uploads Document

```
POST /api/upload
  ↓
refinery-api:
  - Validate file
  - Upload to S3
  - Emit: document.uploaded
  ↓
Redis pub/sub
  ↓
refinery-python listens:
  - Extract text from PDF
  - Emit: document.extracted
  ↓
Redis pub/sub
  ↓
refinery-api listens:
  - Trigger analysis
  - Call Groq LLM
  - Emit: decision.analyzed
  ↓
Generate forms & packet
  ↓
Emit: packet.ready
  ↓
User receives download link
```

---

## Technology Stack

### Backend Services

| Component | Technology | Used By |
|-----------|-----------|---------|
| API Framework | NestJS | refinery-api |
| API Framework | FastAPI | refinery-python |
| Runtime | Node.js 20 | refinery-api |
| Runtime | Python 3.11 | refinery-python |
| Database | MongoDB | refinery-api |
| Cache/Events | Redis | Both |
| Queue | BullMQ | refinery-api |
| Storage | Railway S3 | Both |

### Key Libraries

**refinery-api:**
- `pdf-lib` - PDF form filling
- `@nestjs/swagger` - API docs
- `ioredis` - Redis client
- `bullmq` - Job queues
- `mongoose` - MongoDB ODM

**refinery-python:**
- `fastapi` - Web framework
- `redis` - Event bus
- `pydantic` - Data validation
- *(Phase 1)* `pdfminer.six` - PDF extraction
- *(Phase 1)* `pgvector` - Vector search

---

## Deployment

### Railway Configuration

**Service 1: refinery-api**
```bash
Start Command: npm run start:prod
Port: 3001
Environment Variables:
  - MONGODB_URI
  - REDIS_URL
  - S3_ACCESS_KEY
  - S3_SECRET_KEY
  - PYTHON_API_URL=https://refinery-python.railway.app
```

**Service 2: refinery-python**
```bash
Start Command: uvicorn main:app --host 0.0.0.0 --port 8000
Port: 8000
Environment Variables:
  - REDIS_URL
```

**Service 3: Redis**
```bash
Railway Plugin: Redis
```

---

## Local Development

### Start Both Services

```bash
# Terminal 1: Start Redis
docker run -p 6379:6379 redis:alpine

# Terminal 2: refinery-python
cd refinery-python
source venv/bin/activate
python main.py

# Terminal 3: refinery-api
cd refinery-api
npm run start:dev
```

### Environment Variables

**.env.local (refinery-api):**
```env
MONGODB_URI=mongodb://localhost:27017/refinery
REDIS_URL=redis://localhost:6379
PORT=3001
PYTHON_API_URL=http://localhost:8000
```

**No .env needed for refinery-python** - defaults work for local dev

---

## Current State (Phase 0)

### ✅ Working
- Both services start independently
- Health endpoints responding
- Redis connection established
- All stub endpoints functional
- Event emission working

### ⚠️ In Progress
- Event listeners (services don't react to events yet)
- End-to-end flow testing
- Railway deployment configs

### ❌ Not Started (Phase 1)
- Real PDF extraction (pdfminer)
- Real OCR (ocrmypdf)
- Real LLM analysis (Groq)
- Real retrieval (pgvector)

---

## API Documentation

### refinery-api
Swagger UI: `http://localhost:3001/api/docs`

### refinery-python
FastAPI Docs: `http://localhost:8000/docs`

---

## Testing

### Quick Health Check
```bash
# refinery-api
curl http://localhost:3001/health

# refinery-python
curl http://localhost:8000/health
```

### Test Event Flow
```bash
# Emit extraction event from Python
curl -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d '{"documentId":"test-123","storageUrl":"s3://test"}'

# Check Redis for event
redis-cli SUBSCRIBE document.extracted
```

---

## Directory Structure

```
refinery-repos/
├── refinery-api/              # NestJS API
│   ├── src/
│   │   ├── auth/
│   │   ├── forms/
│   │   ├── va-knowledge/
│   │   ├── pipelines/
│   │   ├── queues/
│   │   └── ...
│   ├── package.json
│   └── .env.local
│
├── refinery-python/           # FastAPI Service
│   ├── main.py               # Single file!
│   ├── requirements.txt
│   └── venv/
│
├── refinery-frontend/         # Nuxt 3 UI
│
├── contracts/                 # Shared schemas
│   ├── schemas/
│   └── types/
│
└── ARCHITECTURE.md           # This file
```

---

## Next Steps

1. ✅ Delete redundant api-gateway
2. ✅ Simplify refinery-python to single file
3. ⏳ Add event listeners to both services
4. ⏳ Test end-to-end event flow
5. ⏳ Deploy to Railway
6. ⏳ Phase 1: Real implementations

---

## Benefits of This Architecture

✅ **Simple Deployment** - Only 2 services + Redis
✅ **Language-Appropriate** - Python for ML/PDF, Node for API
✅ **Event-Driven** - Loosely coupled via Redis
✅ **Independently Scalable** - Each service scales separately
✅ **Easy Local Dev** - Run both services easily
✅ **Production-Ready** - Used patterns work at scale
✅ **Can Split Later** - Easy to extract more services if needed

---

## Key Decisions

1. **Why not microservices?** Too complex for MVP, deployment overhead
2. **Why not one monolith?** Different languages needed for different tasks
3. **Why Redis?** Simple, fast, works great for events and caching
4. **Why Railway?** Easy deployment, good free tier, scales well

---

**Status:** Phase 0 nearly complete! Both services working, need to wire events and deploy.
