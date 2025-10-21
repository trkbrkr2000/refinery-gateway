# FormReady: Requirements to Implementation Mapping
## Unifying the Vision

---

## Executive Summary

**The Challenge:** We have two documents describing FormReady:
- **CLAUDE.md** - Original implementation guide for form filling (user fills web form → generates PDF)
- **Requirements Document** - Comprehensive vision for document analysis platform (user uploads PDF → analyzes → generates filled forms)

**The Solution:** These are **complementary phases** of the same platform, not competing visions. The requirements document describes the **full platform**, while CLAUDE.md describes **Phase 1: Manual Form Filling MVP**.

**Current State:**
- ✅ Form filling architecture designed (CLAUDE.md)
- ✅ VA Knowledge service exists (MCP server with RAG capabilities)
- ⚠️ Services need integration and expansion
- ⚠️ Missing: Ingestion, Extraction, Parsing, Orchestration

---

## Vision Alignment

### Two Product Flows, One Platform

```
┌─────────────────────────────────────────────────────────────┐
│                    FORMREADY PLATFORM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FLOW 1: Manual Form Filling (CLAUDE.md - Phase 1 MVP)     │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐           │
│  │   User   │──▶│Web Form  │──▶│ Filled PDF   │           │
│  │  Manual  │   │Component │   │  Download    │           │
│  └──────────┘   └──────────┘   └──────────────┘           │
│                                                              │
│  FLOW 2: Intelligent Analysis (Requirements - Full Vision)  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐│
│  │  Upload  │──▶│ Extract  │──▶│ Analyze  │──▶│Pre-fill ││
│  │   PDF    │   │  & Parse │   │ w/ RAG   │   │  Forms  ││
│  └──────────┘   └──────────┘   └──────────┘   └────┬────┘│
│                                                       │     │
│                                                       ▼     │
│                                         ┌──────────────────┐│
│                                         │  Use Flow 1 to  ││
│                                         │  Generate Final ││
│                                         │      PDF        ││
│                                         └──────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Key Insight:** Flow 2 (requirements) **uses** Flow 1 (CLAUDE.md) as its final step. The analysis pipeline pre-populates the form data, then leverages the existing form generation service.

---

## Requirements Mapping to Architecture

### Requirement 1: Document Upload & Analysis
**Status:** ❌ Not in CLAUDE.md
**Needs:** New service
**Maps to:**
- `refinery-ingestion/` - New microservice
  - Upload validation
  - Document storage (Railway S3)
  - Unique ID generation
  - Event emission

**Integration Point:**
```typescript
// POST /api/v1/documents/upload
// Returns: { documentId, status, uploadedAt }
// Emits: document.uploaded event
```

---

### Requirement 2: Text Extraction
**Status:** ❌ Not in CLAUDE.md
**Needs:** New service
**Maps to:**
- `refinery-extraction/` - New microservice
  - PDF text extraction (pdfminer.six)
  - OCR processing (ocrmypdf + Tesseract)
  - Table extraction (camelot-py, pdfplumber)
  - Text cleaning (ftfy)

**Integration Point:**
```typescript
// Listens: document.uploaded
// POST /api/v1/extraction/{documentId}/extract
// Returns: { documentId, extractedText, sections, tables }
// Emits: document.extracted event
```

**Technical Stack:**
```python
# Python service (better PDF/OCR libraries)
from pdfminer.six import extract_text
import ocrmypdf
import camelot
import pdfplumber
```

---

### Requirement 3: Intelligent Parsing
**Status:** ❌ Not in CLAUDE.md
**Needs:** New service
**Maps to:**
- `refinery-parsing/` - New microservice
  - Local LLM for section identification
  - Boundary detection
  - Section labeling
  - Relevance scoring

**Integration Point:**
```typescript
// Listens: document.extracted
// POST /api/v1/parsing/{documentId}/parse
// Returns: { documentId, sections: [{ type, content, boundaries }] }
// Emits: document.parsed event
```

**Technology:**
```typescript
// Local LLM options:
// - Ollama (llama3, mistral)
// - llama.cpp
// - GPT4All
```

---

### Requirement 4: RAG Search
**Status:** ✅ **EXISTS** (va-knowledge MCP server)
**Current Capabilities:**
- `va_search()` - Hybrid BM25 + vector search
- `va_fetch_by_citation()` - Get full documents
- CFR 38, M21-1, BVA, CAVC coverage

**Needs:** Integration as microservice
**Maps to:**
- `va-knowledge/` - **Existing service** (convert from MCP to HTTP API)

**Integration Point:**
```typescript
// POST /api/v1/rag/search
// Body: { query, source, limit }
// Returns: { results: [{ citation, snippet, url, score }] }
```

**Action Required:**
1. Wrap existing MCP server with HTTP API (NestJS or FastAPI)
2. Deploy as independent Railway service
3. Keep MCP interface for development

---

### Requirement 5: LLM Analysis
**Status:** ✅ **PARTIAL** (va-knowledge has `va_analyze_decision`)
**Current:** Can analyze decision letters
**Needs:** Expand to full claim analysis

**Maps to:**
- Expand `va-knowledge/` service
- Add new endpoints:
  - `/analyze/claim` - Analyze full claim with evidence
  - `/analyze/medical` - Medical evidence analysis
  - `/analyze/nexus` - Service connection analysis

**Integration Point:**
```typescript
// Listens: document.parsed, rag.searched
// POST /api/v1/analysis/{documentId}/analyze
// Body: { parsedSections, ragContext }
// Returns: {
//   issues: [{ condition, analysis, citations, confidence }],
//   recommendations: [{ action, priority, reasoning }]
// }
// Emits: document.analyzed event
```

---

### Requirement 6: Form Generation
**Status:** ✅ **EXISTS** (CLAUDE.md implementation)
**Current Location:**
- `refinery-api/src/forms/` - Forms controller
- `refinery-api/src/pdf/` - PDF service (pdf-lib)

**Needs:** Accept pre-filled data from analysis
**Enhancement Required:**
```typescript
// Current:
POST /api/v1/forms/{formId}/generate
Body: { first_name: "John", ... } // Manual input

// Enhanced:
POST /api/v1/forms/{formId}/generate
Body: {
  source: "manual" | "analysis",
  documentId?: string,  // If from analysis
  data: { first_name: "John", ... },
  confidence?: { first_name: 0.95, ... }  // From analysis
}
```

**Forms to Add:**
- ✅ VA-21-526EZ (exists in CLAUDE.md)
- ❌ VA-0995 (Supplemental Claim) - **Add**
- ❌ VA-0996 (Higher Level Review) - **Add**
- ❌ VA-10182 (Board Appeal) - **Add**
- ❌ VA-4138 (Statement in Support) - **Add**
- ❌ VA-4142 (Medical Records Release) - **Add**

---

### Requirement 7: Real-time Progress (SSE)
**Status:** ❌ Not in CLAUDE.md
**Needs:** New service
**Maps to:**
- `refinery-orchestrator/` - New microservice
  - Event listener (all services)
  - SSE connection manager
  - Progress tracking
  - Status aggregation

**Integration Point:**
```typescript
// GET /api/v1/documents/{documentId}/status (SSE)
// Emits:
// - data: { stage: "uploading", progress: 10 }
// - data: { stage: "extracting", progress: 30 }
// - data: { stage: "parsing", progress: 50 }
// - data: { stage: "analyzing", progress: 70 }
// - data: { stage: "generating", progress: 90 }
// - data: { stage: "complete", resultUrl: "..." }
```

**Frontend Integration:**
```typescript
// refinery-frontend/composables/useDocumentProgress.ts
const eventSource = new EventSource(
  `${apiUrl}/documents/${docId}/status`
);
```

---

### Requirement 8: Logging & Monitoring
**Status:** ⚠️ Partial in CLAUDE.md
**Needs:** Centralized logging
**Maps to:**
- Railway built-in logging
- Add structured logging to all services
- Add metrics collection

**Technology:**
```typescript
// NestJS services
import { Logger } from '@nestjs/common';

// Python services
import structlog

// Metrics
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
```

---

### Requirement 9: PII Protection
**Status:** ❌ Not in CLAUDE.md
**Needs:** Add to extraction service
**Maps to:**
- `refinery-extraction/` enhancements
  - PII detection (regex + NER models)
  - Redaction before external LLM calls
  - Secure mapping storage (encryption)
  - Restoration in final output

**Implementation:**
```python
# In extraction service
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

# Detect and redact
results = analyzer.analyze(text=document_text, language='en')
anonymized = anonymizer.anonymize(text=document_text, analyzer_results=results)
```

---

### Requirement 10: Robust Extraction
**Status:** ❌ Not in CLAUDE.md
**Covered by:** Requirement 2 (already mapped above)

---

### Requirement 11: Microservices Architecture
**Status:** ⚠️ Partial (CLAUDE.md is monolithic NestJS)
**Needs:** Service separation
**Maps to:** Full platform architecture below

---

## Complete Platform Architecture

### Service Inventory

| Service | Status | Language | Purpose | Repository |
|---------|--------|----------|---------|------------|
| **refinery-frontend** | ✅ Designed | Nuxt 3 | Web UI for both flows | `refinery-frontend/` |
| **refinery-api** | ✅ Partial | NestJS | Legacy monolith → Gateway | `refinery-api/` |
| **refinery-ingestion** | ❌ New | NestJS | Document upload & validation | `refinery-ingestion/` |
| **refinery-extraction** | ❌ New | Python | PDF text/OCR/table extraction | `refinery-extraction/` |
| **refinery-parsing** | ❌ New | Python | LLM section identification | `refinery-parsing/` |
| **va-knowledge** | ✅ Exists | Python | RAG search & analysis | `va-knowledge/` |
| **refinery-forms** | ✅ Exists | NestJS | PDF form generation | Inside `refinery-api/` |
| **refinery-orchestrator** | ❌ New | NestJS | Event bus, SSE, workflow | `refinery-orchestrator/` |

### Repository Structure Options

**Option A: Monorepo (Recommended for MVP)**
```
refinery-platform/
├── services/
│   ├── frontend/          # Nuxt 3
│   ├── api-gateway/       # NestJS (evolved from refinery-api)
│   ├── ingestion/         # NestJS
│   ├── extraction/        # Python (FastAPI)
│   ├── parsing/           # Python (FastAPI)
│   ├── va-knowledge/      # Python (FastAPI) - existing
│   ├── forms/             # NestJS (extracted from api-gateway)
│   └── orchestrator/      # NestJS
├── packages/
│   ├── shared-types/      # TypeScript types
│   └── shared-schemas/    # JSON schemas for forms
├── docs/
│   ├── CLAUDE.md
│   ├── REQUIREMENTS.md
│   └── ARCHITECTURE.md
└── infrastructure/
    ├── docker-compose.yml
    └── railway.json
```

**Option B: Polyrepo (Better for scaling)**
```
refinery-frontend/
refinery-api-gateway/
refinery-ingestion/
refinery-extraction/
refinery-parsing/
va-knowledge/             # existing
refinery-forms/
refinery-orchestrator/
refinery-shared/          # Shared packages
```

---

## Event-Driven Communication

### Event Flow for Document Analysis

```
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ POST /documents/upload
       ▼
┌──────────────┐     document.uploaded
│  Ingestion   ├────────────────────────┐
└──────────────┘                        │
                                        ▼
                              ┌──────────────────┐
                              │  Orchestrator    │
                              │  (Event Router)  │
                              └─────────┬────────┘
                                        │
                     ┌──────────────────┼──────────────────┐
                     ▼                  ▼                  ▼
              ┌─────────────┐    ┌────────────┐    ┌───────────┐
              │ Extraction  │    │  Parsing   │    │    VA     │
              │             │───▶│            │───▶│ Knowledge │
              └─────────────┘    └────────────┘    └─────┬─────┘
                                                           │
                     ┌─────────────────────────────────────┘
                     ▼
              ┌────────────┐     analysis.complete
              │   Forms    ├─────────────────────┐
              │ Generation │                     │
              └────────────┘                     ▼
                     │                  ┌──────────────┐
                     │                  │ Orchestrator │
                     ▼                  │  (SSE Emit)  │
              ┌────────────┐            └──────┬───────┘
              │   S3 PDF   │                   │
              │   Storage  │                   ▼
              └────────────┘            ┌──────────────┐
                                        │   Frontend   │
                                        │ (Download)   │
                                        └──────────────┘
```

### Event Schema

```typescript
// Event types
type DomainEvent =
  | { type: 'document.uploaded'; payload: { documentId, filename, size } }
  | { type: 'document.extracted'; payload: { documentId, text, sections } }
  | { type: 'document.parsed'; payload: { documentId, sections } }
  | { type: 'document.analyzed'; payload: { documentId, analysis } }
  | { type: 'forms.generated'; payload: { documentId, formUrls } }
  | { type: 'processing.error'; payload: { documentId, stage, error } };

// Message bus (Railway Redis or RabbitMQ)
await eventBus.publish('document.uploaded', {
  documentId: '123',
  filename: 'claim.pdf',
  correlationId: 'trace-abc-123',
  timestamp: new Date().toISOString()
});
```

---

## Implementation Phases

### Phase 0: Current State (CLAUDE.md MVP)
**Timeline:** Complete
**Deliverables:**
- ✅ Manual form filling UI
- ✅ PDF generation with pdf-lib
- ✅ Single form schema (VA-21-526EZ minimal)

**What Works:**
- User visits `/forms/va-21-526ez-minimal`
- Fills 3 fields manually
- Downloads filled PDF

---

### Phase 1: Refactor to Microservices Foundation
**Timeline:** 1-2 weeks
**Goal:** Prepare architecture for requirements

**Tasks:**
1. **Extract Forms Service** from `refinery-api`
   ```bash
   # Create new service
   npx @nestjs/cli new refinery-forms

   # Move modules:
   refinery-api/src/forms/ → refinery-forms/src/
   refinery-api/src/pdf/ → refinery-forms/src/
   ```

2. **Create Orchestrator Service**
   ```bash
   npx @nestjs/cli new refinery-orchestrator

   # Add modules:
   - EventsModule (event bus setup)
   - SSEModule (server-sent events)
   - WorkflowModule (state machine)
   ```

3. **Set up Event Bus**
   ```typescript
   // Use Railway Redis as event bus
   npm install @nestjs/microservices redis

   // orchestrator/src/events/events.module.ts
   @Module({
     imports: [
       ClientsModule.register([{
         name: 'EVENT_BUS',
         transport: Transport.REDIS,
         options: { url: process.env.REDIS_URL }
       }])
     ]
   })
   ```

4. **Deploy Separately on Railway**
   ```bash
   # Deploy each service
   railway up --service refinery-forms
   railway up --service refinery-orchestrator
   ```

**Deliverables:**
- ✅ Forms service independent
- ✅ Event bus operational
- ✅ Orchestrator routing events
- ✅ Existing form filling still works

---

### Phase 2: Add Document Ingestion
**Timeline:** 1 week
**Goal:** Satisfy Requirement 1

**Tasks:**
1. **Create Ingestion Service**
   ```bash
   npx @nestjs/cli new refinery-ingestion
   ```

2. **Implement Upload Endpoint**
   ```typescript
   // ingestion/src/upload/upload.controller.ts
   @Post('upload')
   @UseInterceptors(FileInterceptor('file'))
   async uploadDocument(@UploadedFile() file: Express.Multer.File) {
     // Validate PDF
     // Store in Railway S3
     // Generate document ID
     // Emit document.uploaded event
     return { documentId, status: 'uploaded' };
   }
   ```

3. **Configure Railway S3**
   ```bash
   railway plugin create s3
   ```

4. **Add Frontend Upload Page**
   ```vue
   <!-- frontend/pages/analyze/upload.vue -->
   <template>
     <form @submit.prevent="uploadDocument">
       <input type="file" accept=".pdf" @change="handleFile" />
       <button type="submit">Analyze Document</button>
     </form>
   </template>
   ```

**Deliverables:**
- ✅ Upload endpoint working
- ✅ S3 storage configured
- ✅ Events emitted
- ✅ Frontend upload page

---

### Phase 3: Add Extraction Service
**Timeline:** 1-2 weeks
**Goal:** Satisfy Requirement 2, 10

**Tasks:**
1. **Create Python Service**
   ```bash
   # Create FastAPI service
   mkdir refinery-extraction
   cd refinery-extraction
   poetry init
   poetry add fastapi uvicorn pdfminer.six ocrmypdf camelot-py pdfplumber ftfy
   ```

2. **Implement Extraction**
   ```python
   # extraction/app/main.py
   from fastapi import FastAPI
   from pdfminer.six import extract_text

   @app.post("/extract/{document_id}")
   async def extract_document(document_id: str):
       # Download from S3
       # Try digital extraction first
       # Fall back to OCR if needed
       # Extract tables
       # Clean text
       # Emit document.extracted event
       return {"documentId": document_id, "text": text}
   ```

3. **Add Event Listener**
   ```python
   # Listen for document.uploaded events
   # Trigger extraction automatically
   ```

**Deliverables:**
- ✅ PDF text extraction working
- ✅ OCR fallback functional
- ✅ Table extraction operational
- ✅ Events emitted

---

### Phase 4: Add Parsing Service
**Timeline:** 1 week
**Goal:** Satisfy Requirement 3

**Tasks:**
1. **Set up Local LLM**
   ```bash
   # Install Ollama
   curl https://ollama.ai/install.sh | sh
   ollama pull llama3
   ```

2. **Create Parsing Service**
   ```python
   # parsing/app/main.py
   import ollama

   @app.post("/parse/{document_id}")
   async def parse_document(document_id: str, text: str):
       # Use local LLM to identify sections
       # Label section types
       # Identify boundaries
       # Score relevance
       return {"sections": sections}
   ```

**Deliverables:**
- ✅ Local LLM operational
- ✅ Section identification working
- ✅ Boundaries detected
- ✅ Events emitted

---

### Phase 5: Integrate VA Knowledge Service
**Timeline:** 3-5 days
**Goal:** Satisfy Requirement 4, 5

**Tasks:**
1. **Wrap MCP Server with HTTP API**
   ```python
   # va-knowledge/api/main.py
   from fastapi import FastAPI
   from mcp_server import search_nodes, analyze_decision

   @app.post("/search")
   async def search(query: str, source: str = None):
       return await search_nodes(query)

   @app.post("/analyze/claim")
   async def analyze_claim(document_id: str, sections: list):
       # Enhanced analysis endpoint
       return analysis
   ```

2. **Deploy as Railway Service**
   ```bash
   cd va-knowledge
   railway up
   ```

3. **Connect to Orchestrator**
   ```typescript
   // orchestrator listens for document.parsed
   // calls va-knowledge API
   // emits document.analyzed
   ```

**Deliverables:**
- ✅ VA Knowledge accessible via HTTP
- ✅ RAG search working
- ✅ Analysis endpoint operational
- ✅ Integration complete

---

### Phase 6: Connect to Form Generation
**Timeline:** 3-5 days
**Goal:** Satisfy Requirement 6

**Tasks:**
1. **Add Form Schemas**
   ```bash
   # Add remaining VA forms
   forms/schemas/va-0995.json
   forms/schemas/va-0996.json
   forms/schemas/va-10182.json
   forms/schemas/va-4138.json
   forms/schemas/va-4142.json
   ```

2. **Enhance Form Service**
   ```typescript
   // Accept analysis results
   @Post('generate-from-analysis')
   async generateFromAnalysis(
     @Body() { documentId, analysis }
   ) {
     // Map analysis to form fields
     // Generate all relevant forms
     // Return multi-form packet
   }
   ```

3. **Create Form Mapping Logic**
   ```typescript
   // Map analysis outputs to form fields
   const fieldMappings = {
     'first_name': analysis.veteran.firstName,
     'conditions': analysis.issues.map(i => i.condition),
     // ... etc
   };
   ```

**Deliverables:**
- ✅ 5 VA forms available
- ✅ Analysis-to-form mapping working
- ✅ Multi-form PDF generation
- ✅ Complete workflow functional

---

### Phase 7: Add SSE Progress Tracking
**Timeline:** 2-3 days
**Goal:** Satisfy Requirement 7

**Tasks:**
1. **Implement SSE in Orchestrator**
   ```typescript
   // orchestrator/src/sse/sse.controller.ts
   @Sse('documents/:id/status')
   documentStatus(@Param('id') id: string): Observable<MessageEvent> {
     return this.progressService.getProgress(id);
   }
   ```

2. **Track State in Redis**
   ```typescript
   // Store progress state
   await redis.set(`progress:${docId}`, JSON.stringify({
     stage: 'extracting',
     progress: 30,
     message: 'Extracting text from PDF...'
   }));
   ```

3. **Add Frontend Progress UI**
   ```vue
   <!-- frontend/pages/analyze/[id].vue -->
   <ProgressTracker :document-id="documentId" />
   ```

**Deliverables:**
- ✅ SSE connection working
- ✅ Real-time updates functional
- ✅ Progress UI complete
- ✅ Error handling robust

---

### Phase 8: Add PII Protection
**Timeline:** 1 week
**Goal:** Satisfy Requirement 9

**Tasks:**
1. **Add Presidio to Extraction**
   ```python
   poetry add presidio-analyzer presidio-anonymizer
   ```

2. **Implement Redaction**
   ```python
   # Extract → Detect PII → Redact → Store mapping
   analyzer = AnalyzerEngine()
   results = analyzer.analyze(text, language='en')

   # Redact before sending to external LLM
   anonymized = anonymizer.anonymize(text, results)

   # Store mapping securely
   await redis.set(f"pii:{doc_id}", encrypt(mapping))
   ```

3. **Restore in Output**
   ```python
   # Before final form generation
   restored = restore_pii(anonymized_text, mapping)
   ```

**Deliverables:**
- ✅ PII detection working
- ✅ Redaction functional
- ✅ Secure mapping storage
- ✅ Restoration in outputs

---

### Phase 9: Monitoring & Logging
**Timeline:** Ongoing
**Goal:** Satisfy Requirement 8

**Tasks:**
1. **Add Structured Logging**
   ```typescript
   // All NestJS services
   import { Logger } from '@nestjs/common';

   this.logger.log('Document uploaded', {
     documentId,
     correlationId,
     userId
   });
   ```

2. **Set up Railway Logging**
   ```bash
   # Use Railway built-in logging
   railway logs --service refinery-extraction
   ```

3. **Add Prometheus Metrics** (optional)
   ```typescript
   @Module({
     imports: [PrometheusModule.register()]
   })
   ```

**Deliverables:**
- ✅ Logs centralized
- ✅ Traces with correlation IDs
- ✅ Metrics collection
- ✅ Alerts configured

---

## Migration Path for Existing Code

### CLAUDE.md Components → New Architecture

**1. Forms Controller**
```typescript
// FROM: refinery-api/src/forms/forms.controller.ts
// TO: refinery-forms/src/forms/forms.controller.ts
// CHANGE: Add event emission after generation
```

**2. PDF Service**
```typescript
// FROM: refinery-api/src/pdf/pdf.service.ts
// TO: refinery-forms/src/pdf/pdf.service.ts
// CHANGE: Accept both manual and analysis-sourced data
```

**3. Form Schemas**
```json
// FROM: refinery-api/schemas/forms/va-21-526ez-minimal.json
// TO: refinery-forms/schemas/va-21-526ez.json
// CHANGE: Expand from 3 fields to full form
```

**4. Frontend Form Component**
```vue
// FROM: refinery-frontend/components/DynamicForm.vue
// TO: Keep in place, no changes needed!
// WORKS WITH: Both manual and pre-filled data
```

---

## Technology Stack Summary

| Layer | Technology | Services |
|-------|------------|----------|
| **Frontend** | Nuxt 3, Vue 3, Tailwind | refinery-frontend |
| **API Gateway** | NestJS | refinery-api-gateway |
| **Business Logic** | NestJS | ingestion, orchestrator, forms |
| **Data Processing** | Python (FastAPI) | extraction, parsing |
| **AI/ML** | Python (FastAPI) | va-knowledge |
| **Local LLM** | Ollama (llama3) | parsing service |
| **Database** | MongoDB | document metadata |
| **Cache/Events** | Redis | event bus, SSE state |
| **Storage** | Railway S3 | PDF storage |
| **Deployment** | Railway | all services |

---

## Testing Strategy

### Unit Tests
```typescript
// Each service has unit tests
describe('PDFService', () => {
  it('should fill text fields', async () => {
    const result = await pdfService.fillField(field, 'John');
    expect(result).toBeDefined();
  });
});
```

### Integration Tests
```typescript
// Test service-to-service communication
describe('Document Processing Flow', () => {
  it('should process uploaded document through full pipeline', async () => {
    const upload = await ingest.upload(file);
    // Wait for events...
    const result = await forms.getGeneratedPDF(upload.documentId);
    expect(result).toBeDefined();
  });
});
```

### E2E Tests
```typescript
// Test full user flows
describe('Document Analysis E2E', () => {
  it('should upload, analyze, and generate forms', async () => {
    await page.goto('/analyze/upload');
    await page.setInputFiles('input[type=file]', 'test.pdf');
    await page.click('button[type=submit]');
    await expect(page.locator('.progress-bar')).toBeVisible();
    // ... continue through flow
  });
});
```

---

## Success Metrics

### Phase 1-3 (MVP++)
- ✅ Document upload working
- ✅ Text extraction 95%+ accuracy
- ✅ Basic event flow functional
- 📊 **Metric:** Process 10 test documents successfully

### Phase 4-6 (Core Platform)
- ✅ Full analysis pipeline working
- ✅ Form generation from analysis
- ✅ 5 VA forms supported
- 📊 **Metric:** 50 test documents with 90%+ accuracy

### Phase 7-9 (Production Ready)
- ✅ Real-time progress tracking
- ✅ PII protection active
- ✅ Monitoring and alerts
- 📊 **Metric:** 100 real users, <5% error rate

---

## Next Steps

### Immediate Actions (This Week)
1. **Decision:** Choose monorepo vs polyrepo
2. **Setup:** Initialize service structure
3. **Refactor:** Extract forms service from refinery-api
4. **Deploy:** Test independent deployment on Railway

### This Month
1. **Build:** Ingestion + Extraction services (Phase 2-3)
2. **Test:** End-to-end document upload and extraction
3. **Integrate:** Connect to existing va-knowledge

### Next Month
1. **Build:** Parsing + full analysis integration (Phase 4-5)
2. **Enhance:** Add remaining VA forms (Phase 6)
3. **Polish:** SSE + PII protection (Phase 7-8)

### Launch Target: 2-3 Months
- Full document analysis pipeline
- 5 VA forms supported
- Real-time progress tracking
- Production monitoring
- 100 beta users

---

## Conclusion

**The Big Picture:**
- CLAUDE.md is **Phase 1** (manual form filling MVP) ✅
- Requirements doc is **the full vision** (intelligent analysis platform)
- These are **complementary**, not competing
- va-knowledge service already exists and covers major requirements ✅
- Path forward is **clear and incremental**

**What to Build Next:**
1. Refactor to microservices (1-2 weeks)
2. Add ingestion + extraction (2-3 weeks)
3. Integrate va-knowledge (1 week)
4. Connect analysis to form generation (1 week)
5. Add SSE + PII protection (1-2 weeks)

**Total Time to Full Platform:** 8-12 weeks

**You already have:**
- ✅ Form generation working (CLAUDE.md)
- ✅ RAG analysis working (va-knowledge)
- ✅ Railway deployment experience

**You need to build:**
- Document ingestion
- Text extraction
- LLM parsing
- Service orchestration
- Integration glue

**This is achievable.** Let's build it! 🚀
