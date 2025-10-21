# FormReady Platform - Implementation Roadmap
## Fast, Autonomous, Low-Coupling Build Strategy

> **Philosophy:** Wire skeletons first, then fill in each service logically. This approach maximizes parallelization, minimizes blocking dependencies, and allows independent service deployment from day one.

---

## Table of Contents
1. [Phase 0: Foundation & Wiring (Skeletons)](#phase-0-foundation--wiring-skeletons)
2. [Phase 1: Make Deterministic Steps Real](#phase-1-make-deterministic-steps-real)
3. [Phase 2: Intelligence & Observability](#phase-2-intelligence--observability)
4. [Phase 3: Enhancements & Scaling](#phase-3-enhancements--scaling)
5. [Service Architecture](#service-architecture)
6. [Event Flow Diagram](#event-flow-diagram)
7. [Technology Stack](#technology-stack)
8. [Deployment Strategy](#deployment-strategy)

---

## Phase 0: Foundation & Wiring (Skeletons)

**Goal:** Spin up every service with stubs, so orchestration and events flow end-to-end.

**Success Criteria:** ✅ POST /upload → see it move through fake stages → SSE stream updates → GET /documents/:id returns composed stub data.

### 0.1 Contracts Repository

**Purpose:** Single source of truth for all service contracts, schemas, and types.

- [ ] **Initialize contracts repository**
  ```bash
  mkdir contracts && cd contracts
  npm init -y
  npm install -D typescript @types/node json-schema-to-typescript openapi-typescript
  ```

- [ ] **Define core domain types**
  ```typescript
  // contracts/schemas/decision-structured.schema.json
  // contracts/schemas/retrieval-pack.schema.json
  // contracts/schemas/issue-analysis.schema.json
  // contracts/schemas/events/*.schema.json
  ```

- [ ] **Define event envelopes**
  - [ ] `document.uploaded`
  - [ ] `document.extracted`
  - [ ] `document.spans.ready`
  - [ ] `document.indexed`
  - [ ] `decision.analyzed`
  - [ ] `packet.ready`
  - [ ] `processing.error`

- [ ] **Generate TypeScript types**
  ```bash
  npm run generate:types
  # Outputs: contracts/types/typescript/**/*.ts
  ```

- [ ] **Generate Python types**
  ```bash
  npm run generate:python-types
  # Outputs: contracts/types/python/**/*.py
  ```

- [ ] **Generate OpenAPI specs**
  ```bash
  npm run generate:openapi
  # Outputs: contracts/openapi/**/*.yaml
  ```

- [ ] **Publish as npm package**
  ```bash
  npm version 0.1.0
  npm publish @formready/contracts
  ```

- [ ] **Publish to PyPI**
  ```bash
  poetry build
  poetry publish
  ```

**Deliverables:**
- ✅ JSON schemas for all domain objects
- ✅ TypeScript types published to npm
- ✅ Python types published to PyPI
- ✅ Versioned contract releases
- ✅ OpenAPI specs for all services

---

### 0.2 API Gateway (NestJS + Fastify)

**Purpose:** Single entry point for all client requests, orchestrates service calls, manages SSE connections.

- [ ] **Initialize NestJS project**
  ```bash
  npx @nestjs/cli new api-gateway
  cd api-gateway
  npm install @nestjs/platform-fastify @nestjs/microservices
  npm install bullmq ioredis
  npm install @formready/contracts
  ```

- [ ] **Configure Fastify adapter**
  ```typescript
  // src/main.ts
  import { NestFactory } from '@nestjs/core';
  import { FastifyAdapter } from '@nestjs/platform-fastify';

  const app = await NestFactory.create(
    AppModule,
    new FastifyAdapter({ logger: true })
  );
  ```

- [ ] **Stub all routes**
  - [ ] `POST /api/v1/upload` → 202 Accepted, returns `{ documentId, status: 'queued' }`
  - [ ] `GET /api/v1/documents/:id` → 200 OK, returns stub document data
  - [ ] `GET /api/v1/documents/:id/status` → SSE connection (stub events)
  - [ ] `POST /api/v1/analyze/:id` → 202 Accepted
  - [ ] `GET /api/v1/export/:id` → 200 OK, stub PDF URL
  - [ ] `POST /api/v1/bridge/formready` → 200 OK, stub form data
  - [ ] `GET /health` → health check
  - [ ] `GET /ready` → readiness check

- [ ] **Set up BullMQ queues**
  ```typescript
  // src/queues/queues.module.ts
  @Module({
    imports: [
      BullModule.forRoot({
        connection: { host: 'localhost', port: 6379 }
      }),
      BullModule.registerQueue(
        { name: 'document-processing' },
        { name: 'analysis' },
        { name: 'export' }
      )
    ]
  })
  ```

- [ ] **Set up Redis event bus**
  ```typescript
  // src/events/event-bus.module.ts
  @Module({
    imports: [
      ClientsModule.register([{
        name: 'EVENT_BUS',
        transport: Transport.REDIS,
        options: { host: 'localhost', port: 6379 }
      }])
    ]
  })
  ```

- [ ] **Implement SSE controller**
  ```typescript
  // src/realtime/sse.controller.ts
  @Sse('documents/:id/status')
  streamStatus(@Param('id') id: string): Observable<MessageEvent> {
    return this.realtimeService.getDocumentUpdates(id);
  }
  ```

- [ ] **Add request validation**
  ```typescript
  // Use class-validator for DTOs
  npm install class-validator class-transformer
  ```

- [ ] **Add global error handling**
  ```typescript
  // src/filters/http-exception.filter.ts
  @Catch(HttpException)
  export class HttpExceptionFilter implements ExceptionFilter { }
  ```

- [ ] **Add OpenAPI documentation**
  ```typescript
  npm install @nestjs/swagger
  // src/main.ts - add Swagger setup
  ```

- [ ] **Deploy to Railway**
  ```bash
  railway up --service api-gateway
  railway vars set NODE_ENV=production PORT=3000
  ```

**Deliverables:**
- ✅ API Gateway accepting requests
- ✅ All routes stubbed and documented
- ✅ BullMQ queues configured
- ✅ Redis event bus connected
- ✅ SSE endpoint working (stub data)
- ✅ Health/readiness checks
- ✅ Deployed to Railway

---

### 0.3 Ingestion Service (Fastify)

**Purpose:** Handle file uploads, validate, compute hashes, store to S3, emit events.

- [ ] **Initialize Fastify project**
  ```bash
  mkdir ingestion-service && cd ingestion-service
  npm init -y
  npm install fastify @fastify/multipart @aws-sdk/client-s3
  npm install ioredis crypto
  npm install @formready/contracts
  ```

- [ ] **Implement upload endpoint**
  ```typescript
  // src/routes/upload.ts
  fastify.post('/upload', async (request, reply) => {
    // Validate file type (PDF only)
    // Validate file size (max 50MB)
    // Compute SHA-256 hash
    // Generate document ID (UUID)
    // Upload to S3 with metadata
    // Emit document.uploaded event
    return { documentId, status: 'uploaded', hash };
  });
  ```

- [ ] **Configure S3 client**
  ```typescript
  // src/storage/s3.client.ts
  import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  ```

- [ ] **Implement file validation**
  - [ ] Check MIME type is `application/pdf`
  - [ ] Check file size < 50MB
  - [ ] Check file is not corrupted (basic PDF header check)

- [ ] **Implement event emission**
  ```typescript
  // src/events/event-emitter.ts
  async function emitDocumentUploaded(payload: DocumentUploadedEvent) {
    await redis.publish('document.uploaded', JSON.stringify(payload));
  }
  ```

- [ ] **Add health endpoint**
  ```typescript
  fastify.get('/health', async () => ({ status: 'ok' }));
  ```

- [ ] **Add OpenAPI schema**
  ```typescript
  npm install @fastify/swagger @fastify/swagger-ui
  ```

- [ ] **Deploy to Railway**
  ```bash
  railway up --service ingestion
  railway vars set NODE_ENV=production PORT=3001
  ```

**Deliverables:**
- ✅ Upload endpoint accepting PDFs
- ✅ S3 storage working
- ✅ SHA-256 hashing
- ✅ Event emission to Redis
- ✅ Validation and error handling
- ✅ Deployed to Railway

---

### 0.4 Extraction Service (FastAPI)

**Purpose:** Extract text, tables, and structure from PDFs. Initially stubbed, later made real.

- [ ] **Initialize FastAPI project**
  ```bash
  mkdir extraction-service && cd extraction-service
  poetry init
  poetry add fastapi uvicorn redis pydantic
  poetry add formready-contracts  # Python version
  ```

- [ ] **Stub extraction endpoints**
  ```python
  # app/main.py
  from fastapi import FastAPI

  @app.post("/extract")
  async def extract_document(document_id: str):
      # Stub: return fake DecisionStructured
      return {
          "documentId": document_id,
          "veteranInfo": {"name": "REDACTED"},
          "ratings": [],
          "denialReasons": []
      }

  @app.get("/status/{document_id}")
  async def get_status(document_id: str):
      return {"status": "completed", "progress": 100}

  @app.get("/results/{document_id}")
  async def get_results(document_id: str):
      return {"documentId": document_id, "extractedData": {}}
  ```

- [ ] **Set up event listener**
  ```python
  # app/events/listener.py
  import redis.asyncio as redis

  async def listen_for_uploads():
      pubsub = redis_client.pubsub()
      await pubsub.subscribe('document.uploaded')
      async for message in pubsub.listen():
          # Trigger extraction
          pass
  ```

- [ ] **Emit stub events**
  ```python
  # app/events/emitter.py
  async def emit_document_extracted(payload: dict):
      await redis_client.publish(
          'document.extracted',
          json.dumps(payload)
      )
  ```

- [ ] **Add health endpoint**
  ```python
  @app.get("/health")
  async def health():
      return {"status": "ok"}
  ```

- [ ] **Deploy to Railway**
  ```bash
  railway up --service extraction
  railway vars set PYTHON_VERSION=3.11 PORT=8000
  ```

**Deliverables:**
- ✅ Stub endpoints returning fake data
- ✅ Event listener for `document.uploaded`
- ✅ Event emitter for `document.extracted`
- ✅ Health endpoint
- ✅ Deployed to Railway

---

### 0.5 Local Parser Service (FastAPI + Ollama)

**Purpose:** Use local LLM to identify document sections and spans. Initially stubbed.

- [ ] **Initialize FastAPI project**
  ```bash
  mkdir parser-service && cd parser-service
  poetry init
  poetry add fastapi uvicorn redis pydantic
  poetry add formready-contracts
  ```

- [ ] **Stub parse endpoint**
  ```python
  # app/main.py
  @app.post("/parse")
  async def parse_document(document_id: str, text: str):
      # Stub: return fake span data
      return {
          "documentId": document_id,
          "spans": [
              {"type": "veteran_info", "start": 0, "end": 100},
              {"type": "rating_decision", "start": 101, "end": 500}
          ]
      }
  ```

- [ ] **Emit stub event**
  ```python
  async def emit_spans_ready(payload: dict):
      await redis_client.publish('document.spans.ready', json.dumps(payload))
  ```

- [ ] **Add health endpoint**
  ```python
  @app.get("/health")
  async def health():
      return {"status": "ok", "llm": "not_loaded"}
  ```

- [ ] **Deploy to Railway**
  ```bash
  railway up --service parser
  ```

**Deliverables:**
- ✅ Stub parse endpoint
- ✅ Event emission
- ✅ Deployed to Railway

---

### 0.6 Retriever Service (FastAPI)

**Purpose:** Retrieve relevant VA regulations and precedents. Initially stubbed.

- [ ] **Initialize FastAPI project**
  ```bash
  mkdir retriever-service && cd retriever-service
  poetry init
  poetry add fastapi uvicorn redis pydantic
  poetry add formready-contracts
  ```

- [ ] **Stub retrieve endpoint**
  ```python
  # app/main.py
  @app.post("/retrieve")
  async def retrieve_context(query: str, top_k: int = 5):
      # Stub: return static RetrievalPack
      return {
          "query": query,
          "results": [
              {
                  "citation": "38 CFR 3.303",
                  "snippet": "Direct service connection...",
                  "score": 0.95,
                  "url": "https://ecfr.gov/..."
              }
          ]
      }
  ```

- [ ] **Emit stub event**
  ```python
  async def emit_document_indexed(payload: dict):
      await redis_client.publish('document.indexed', json.dumps(payload))
  ```

- [ ] **Add health endpoint**
  ```python
  @app.get("/health")
  async def health():
      return {"status": "ok", "index": "not_loaded"}
  ```

- [ ] **Deploy to Railway**
  ```bash
  railway up --service retriever
  ```

**Deliverables:**
- ✅ Stub retrieval endpoint
- ✅ Event emission
- ✅ Deployed to Railway

---

### 0.7 Analysis Service (NestJS or Fastify)

**Purpose:** Perform LLM-based analysis of decisions using retrieved context. Initially stubbed.

- [ ] **Initialize NestJS project**
  ```bash
  npx @nestjs/cli new analysis-service
  cd analysis-service
  npm install @formready/contracts ioredis
  ```

- [ ] **Stub analysis endpoint**
  ```typescript
  // src/analysis/analysis.controller.ts
  @Post('analyze')
  async analyzeDocument(@Body() payload: AnalysisRequest) {
    // Stub: return canned IssueAnalysis
    return {
      documentId: payload.documentId,
      issues: [
        {
          condition: "Tinnitus",
          decision: "Denied",
          reasoning: "Insufficient nexus",
          citations: ["38 CFR 3.303"],
          confidence: 0.85
        }
      ],
      recommendations: [
        {
          action: "File Supplemental Claim",
          priority: "high",
          reasoning: "New medical evidence available"
        }
      ]
    };
  }
  ```

- [ ] **Emit stub event**
  ```typescript
  async emitDecisionAnalyzed(payload: any) {
    await this.redisClient.publish(
      'decision.analyzed',
      JSON.stringify(payload)
    );
  }
  ```

- [ ] **Add health endpoint**

- [ ] **Deploy to Railway**
  ```bash
  railway up --service analysis
  ```

**Deliverables:**
- ✅ Stub analysis endpoint
- ✅ Event emission
- ✅ Deployed to Railway

---

### 0.8 Exporter & FormReady Bridge (Fastify/NestJS)

**Purpose:** Generate final packets (PDF, JSON) and bridge to FormReady form generation.

- [ ] **Initialize Fastify project**
  ```bash
  mkdir exporter-service && cd exporter-service
  npm init -y
  npm install fastify @formready/contracts ioredis
  ```

- [ ] **Stub export endpoint**
  ```typescript
  // src/routes/export.ts
  fastify.post('/export', async (request, reply) => {
    // Stub: return dummy PDF URL
    return {
      documentId: request.body.documentId,
      packetUrl: "https://s3.../stub-packet.pdf",
      generatedAt: new Date().toISOString()
    };
  });
  ```

- [ ] **Stub FormReady bridge**
  ```typescript
  // src/routes/bridge.ts
  fastify.post('/bridge/formready', async (request, reply) => {
    // Stub: return form field mappings
    return {
      formId: "va-21-526ez",
      fields: {
        first_name: "John",
        last_name: "Doe",
        // ... mapped from analysis
      }
    };
  });
  ```

- [ ] **Emit stub event**
  ```typescript
  async function emitPacketReady(payload: any) {
    await redis.publish('packet.ready', JSON.stringify(payload));
  }
  ```

- [ ] **Add health endpoint**

- [ ] **Deploy to Railway**
  ```bash
  railway up --service exporter
  ```

**Deliverables:**
- ✅ Stub export endpoint
- ✅ Stub FormReady bridge
- ✅ Event emission
- ✅ Deployed to Railway

---

### 0.9 Corpus Loader (FastAPI/Worker)

**Purpose:** Ingest VA regulations and precedents into vector database. Initially stubbed.

- [ ] **Initialize FastAPI project**
  ```bash
  mkdir corpus-loader && cd corpus-loader
  poetry init
  poetry add fastapi uvicorn redis pydantic
  ```

- [ ] **Stub corpus ingest endpoint**
  ```python
  # app/main.py
  @app.post("/admin/corpus/ingest")
  async def ingest_corpus(source: str):
      # Stub: return fake stats
      return {
          "revision": "v1.0.0",
          "stats": {
              "documents": 0,
              "chunks": 0,
              "embeddings": 0
          },
          "status": "completed"
      }
  ```

- [ ] **Add health endpoint**

- [ ] **Deploy to Railway**
  ```bash
  railway up --service corpus-loader
  ```

**Deliverables:**
- ✅ Stub corpus ingest endpoint
- ✅ Deployed to Railway

---

### 0.10 Event Bus + SSE (NATS/Redis)

**Purpose:** Wire all services together with event-driven messaging.

- [ ] **Choose event bus (Redis Pub/Sub recommended for MVP)**
  ```bash
  railway add redis
  ```

- [ ] **Define event topics**
  - `document.uploaded`
  - `document.extracted`
  - `document.spans.ready`
  - `document.indexed`
  - `decision.analyzed`
  - `packet.ready`
  - `processing.error`

- [ ] **Wire event flow**
  ```
  document.uploaded → Extraction Service
  document.extracted → Parser Service
  document.spans.ready → Retriever Service
  document.indexed → Analysis Service
  decision.analyzed → Exporter Service
  packet.ready → API Gateway (SSE update)
  ```

- [ ] **Configure API Gateway to subscribe to all events**
  ```typescript
  // api-gateway/src/events/event-subscriber.ts
  @Injectable()
  export class EventSubscriber implements OnModuleInit {
    async onModuleInit() {
      this.redisClient.subscribe(
        'document.uploaded',
        'document.extracted',
        'document.spans.ready',
        'document.indexed',
        'decision.analyzed',
        'packet.ready',
        'processing.error'
      );

      this.redisClient.on('message', (channel, message) => {
        this.sseService.broadcast(channel, JSON.parse(message));
      });
    }
  }
  ```

- [ ] **Implement SSE broadcasting**
  ```typescript
  // api-gateway/src/realtime/sse.service.ts
  broadcast(documentId: string, event: DomainEvent) {
    const connections = this.connections.get(documentId);
    connections?.forEach(connection => {
      connection.next({
        data: event,
        type: event.type
      });
    });
  }
  ```

- [ ] **Test end-to-end event flow**
  ```bash
  # Terminal 1: Subscribe to SSE
  curl -N http://localhost:3000/api/v1/documents/test-123/status

  # Terminal 2: Upload document
  curl -F "file=@test.pdf" http://localhost:3000/api/v1/upload

  # Expected: SSE updates in Terminal 1
  ```

**Deliverables:**
- ✅ Redis event bus configured
- ✅ All services publishing events
- ✅ API Gateway subscribing to events
- ✅ SSE broadcasting to clients
- ✅ End-to-end flow working with stubs

---

## Phase 0 Completion Checklist

- [ ] All 10 services deployed to Railway
- [ ] All services have health endpoints
- [ ] Contracts package published to npm and PyPI
- [ ] End-to-end event flow working
- [ ] SSE real-time updates working
- [ ] Can POST /upload and see stub updates flow through
- [ ] OpenAPI docs available for all services
- [ ] Basic error handling in place
- [ ] Environment variables configured on Railway

**Test Command:**
```bash
# Upload document
DOCUMENT_ID=$(curl -F "file=@test.pdf" http://localhost:3000/api/v1/upload | jq -r .documentId)

# Watch SSE updates
curl -N http://localhost:3000/api/v1/documents/$DOCUMENT_ID/status

# Expected events:
# - document.uploaded
# - document.extracted
# - document.spans.ready
# - document.indexed
# - decision.analyzed
# - packet.ready
```

---

## Phase 1: Make Deterministic Steps Real

**Goal:** Replace stubs with real, non-AI logic that's fast and predictable.

**Success Criteria:** ✅ Real end-to-end flow for a single decision letter → structured text → retrieval → Groq → packet.

### 1.1 Real Extraction (Extraction Service)

- [ ] **Install PDF processing libraries**
  ```bash
  cd extraction-service
  poetry add pdfminer.six ocrmypdf camelot-py[cv] pdfplumber ftfy
  poetry add Pillow pytesseract
  ```

- [ ] **Implement digital PDF text extraction**
  ```python
  # app/extraction/digital.py
  from pdfminer.six import extract_text

  def extract_digital_pdf(pdf_path: str) -> str:
      text = extract_text(pdf_path)
      return text
  ```

- [ ] **Implement OCR for scanned PDFs**
  ```python
  # app/extraction/ocr.py
  import ocrmypdf

  def extract_scanned_pdf(pdf_path: str) -> str:
      output_path = f"{pdf_path}.ocr.pdf"
      ocrmypdf.ocr(pdf_path, output_path, force_ocr=True)
      return extract_text(output_path)
  ```

- [ ] **Implement table extraction**
  ```python
  # app/extraction/tables.py
  import camelot

  def extract_tables(pdf_path: str) -> list:
      tables = camelot.read_pdf(pdf_path, pages='all')
      return [table.df.to_dict() for table in tables]
  ```

- [ ] **Implement section detection**
  ```python
  # app/extraction/sections.py
  import re

  def detect_sections(text: str) -> dict:
      # Regex patterns for VA decision letter sections
      patterns = {
          'veteran_info': r'Veteran.*?SSN.*?DOB',
          'rating_decisions': r'RATING DECISION.*?(?=\n\n)',
          'denial_reasons': r'REASONS?.*?(?=\n\n)'
      }
      # ... extraction logic
  ```

- [ ] **Implement text cleaning**
  ```python
  # app/extraction/cleaner.py
  import ftfy

  def clean_text(text: str) -> str:
      # Fix Unicode issues
      text = ftfy.fix_text(text)
      # Remove hyphenation
      text = re.sub(r'-\n', '', text)
      # Normalize whitespace
      text = re.sub(r'\s+', ' ', text)
      return text
  ```

- [ ] **Replace stub endpoint with real extraction**
  ```python
  @app.post("/extract")
  async def extract_document(document_id: str):
      # Download from S3
      pdf_path = await download_from_s3(document_id)

      # Try digital extraction first
      try:
          text = extract_digital_pdf(pdf_path)
      except Exception:
          # Fall back to OCR
          text = extract_scanned_pdf(pdf_path)

      # Clean text
      text = clean_text(text)

      # Extract tables
      tables = extract_tables(pdf_path)

      # Detect sections
      sections = detect_sections(text)

      # Build DecisionStructured
      result = build_decision_structured(text, tables, sections)

      # Emit real event
      await emit_document_extracted({
          "documentId": document_id,
          "data": result
      })

      return result
  ```

- [ ] **Add extraction quality metrics**
  ```python
  # Track extraction success rate, time, errors
  ```

- [ ] **Test on real VA decision letters**
  ```bash
  pytest tests/test_extraction_real.py
  ```

**Deliverables:**
- ✅ Real PDF text extraction
- ✅ OCR fallback working
- ✅ Table extraction functional
- ✅ Section detection accurate
- ✅ Text cleaning applied
- ✅ Real DecisionStructured output
- ✅ Tested on 10+ real decision letters

---

### 1.2 Real Retrieval (Retriever Service)

- [ ] **Install vector database dependencies**
  ```bash
  cd retriever-service
  poetry add pgvector psycopg2-binary sqlalchemy
  poetry add sentence-transformers  # For embeddings
  poetry add rank-bm25  # For BM25 search
  ```

- [ ] **Set up PostgreSQL with pgvector**
  ```sql
  -- Run on Railway Postgres
  CREATE EXTENSION IF NOT EXISTS vector;

  CREATE TABLE corpus_chunks (
    id UUID PRIMARY KEY,
    source VARCHAR(50),  -- 'CFR38', 'M21-1', 'BVA', etc.
    citation VARCHAR(255),
    content TEXT,
    embedding vector(384),  -- MiniLM embeddings
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX ON corpus_chunks USING ivfflat (embedding vector_cosine_ops);
  CREATE INDEX ON corpus_chunks (source);
  CREATE INDEX ON corpus_chunks USING gin (metadata);
  ```

- [ ] **Implement embedding generation**
  ```python
  # app/retrieval/embedder.py
  from sentence_transformers import SentenceTransformer

  model = SentenceTransformer('all-MiniLM-L6-v2')

  def generate_embedding(text: str) -> list:
      return model.encode(text).tolist()
  ```

- [ ] **Implement BM25 search**
  ```python
  # app/retrieval/bm25.py
  from rank_bm25 import BM25Okapi

  def bm25_search(query: str, corpus: list, top_k: int) -> list:
      tokenized_corpus = [doc.split() for doc in corpus]
      bm25 = BM25Okapi(tokenized_corpus)
      scores = bm25.get_scores(query.split())
      top_indices = scores.argsort()[-top_k:][::-1]
      return top_indices
  ```

- [ ] **Implement hybrid search**
  ```python
  # app/retrieval/hybrid.py
  async def hybrid_search(
      query: str,
      source: str = None,
      top_k: int = 5
  ) -> list:
      # Generate query embedding
      query_embedding = generate_embedding(query)

      # Vector search (pgvector)
      vector_results = await db.execute("""
          SELECT id, citation, content,
                 1 - (embedding <=> $1::vector) as similarity
          FROM corpus_chunks
          WHERE source = $2 OR $2 IS NULL
          ORDER BY embedding <=> $1::vector
          LIMIT $3
      """, query_embedding, source, top_k)

      # BM25 search
      bm25_results = bm25_search(query, corpus_texts, top_k)

      # Combine with reciprocal rank fusion
      combined = reciprocal_rank_fusion(vector_results, bm25_results)

      return combined[:top_k]
  ```

- [ ] **Replace stub endpoint with real retrieval**
  ```python
  @app.post("/retrieve")
  async def retrieve_context(request: RetrievalRequest):
      results = await hybrid_search(
          query=request.query,
          source=request.source,
          top_k=request.top_k
      )

      return {
          "query": request.query,
          "results": [
              {
                  "citation": r.citation,
                  "snippet": r.content[:500],
                  "score": r.similarity,
                  "url": build_citation_url(r.citation)
              }
              for r in results
          ]
      }
  ```

- [ ] **Test retrieval accuracy**
  ```python
  # Use test queries from VA claims
  pytest tests/test_retrieval_accuracy.py
  ```

**Deliverables:**
- ✅ pgvector database configured
- ✅ Embedding generation working
- ✅ BM25 search implemented
- ✅ Hybrid search functional
- ✅ Real retrieval results
- ✅ Tested with representative queries

---

### 1.3 Real Analysis (Analysis Service)

- [ ] **Install Groq SDK**
  ```bash
  cd analysis-service
  npm install groq-sdk zod
  ```

- [ ] **Define analysis schema with Zod**
  ```typescript
  // src/analysis/schemas.ts
  import { z } from 'zod';

  const IssueAnalysisSchema = z.object({
    condition: z.string(),
    decision: z.enum(['Granted', 'Denied', 'Deferred']),
    reasoning: z.string(),
    citations: z.array(z.string()),
    confidence: z.number().min(0).max(1),
    recommendations: z.array(z.object({
      action: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      reasoning: z.string()
    }))
  });

  const DecisionAnalysisSchema = z.object({
    documentId: z.string(),
    issues: z.array(IssueAnalysisSchema),
    overallRecommendations: z.array(z.string())
  });
  ```

- [ ] **Implement Groq API call with schema validation**
  ```typescript
  // src/analysis/groq-client.ts
  import Groq from 'groq-sdk';

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  async function analyzeWithGroq(
    extractedData: DecisionStructured,
    retrievalContext: RetrievalPack
  ): Promise<DecisionAnalysis> {
    const prompt = buildAnalysisPrompt(extractedData, retrievalContext);

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1  // Low for consistency
    });

    const rawAnalysis = JSON.parse(response.choices[0].message.content);

    // Validate with Zod
    return DecisionAnalysisSchema.parse(rawAnalysis);
  }
  ```

- [ ] **Implement schema repair loop**
  ```typescript
  // src/analysis/repair-loop.ts
  async function analyzeWithRepair(
    extractedData: DecisionStructured,
    retrievalContext: RetrievalPack,
    maxRetries: number = 3
  ): Promise<DecisionAnalysis> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const analysis = await analyzeWithGroq(extractedData, retrievalContext);
        return analysis;  // Success!
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Build repair prompt with validation errors
          const repairPrompt = buildRepairPrompt(error);
          // Retry with repair guidance
          continue;
        }
        throw error;
      }
    }
    throw new Error('Analysis failed after max retries');
  }
  ```

- [ ] **Build analysis prompts**
  ```typescript
  // src/analysis/prompts.ts
  const SYSTEM_PROMPT = `
  You are an expert VA disability claims analyst. Analyze decision letters
  with precision, citing specific regulations and precedents.

  Always return valid JSON matching the DecisionAnalysis schema.
  `;

  function buildAnalysisPrompt(
    extractedData: DecisionStructured,
    retrievalContext: RetrievalPack
  ): string {
    return `
  # Decision Letter Analysis

  ## Extracted Information
  ${JSON.stringify(extractedData, null, 2)}

  ## Relevant Regulations & Precedents
  ${retrievalContext.results.map(r => `
  - ${r.citation}: ${r.snippet}
  `).join('\n')}

  ## Task
  Analyze each denied condition and provide:
  1. Reasoning for denial (cite specific regulations)
  2. Recommended next steps (Supplemental Claim, HLR, or Appeal)
  3. Evidence gaps to address
  4. Confidence in your analysis (0-1)

  Return as JSON matching the DecisionAnalysis schema.
  `;
  }
  ```

- [ ] **Replace stub endpoint with real analysis**
  ```typescript
  // src/analysis/analysis.controller.ts
  @Post('analyze')
  async analyzeDocument(@Body() request: AnalysisRequest) {
    // Fetch extracted data
    const extractedData = await this.getExtractedData(request.documentId);

    // Build retrieval queries from extracted data
    const queries = this.buildQueriesFromExtraction(extractedData);

    // Retrieve context for each query
    const retrievalPacks = await Promise.all(
      queries.map(q => this.retrieverClient.retrieve(q))
    );

    // Combine retrieval context
    const combinedContext = this.combineRetrievalPacks(retrievalPacks);

    // Analyze with Groq (with repair loop)
    const analysis = await this.analyzeWithRepair(extractedData, combinedContext);

    // Emit event
    await this.emitDecisionAnalyzed({
      documentId: request.documentId,
      analysis
    });

    return analysis;
  }
  ```

- [ ] **Add citation verification**
  ```typescript
  // Verify that cited regulations actually exist
  async function verifyCitations(analysis: DecisionAnalysis): Promise<boolean> {
    const allCitations = analysis.issues.flatMap(i => i.citations);
    // Check against corpus
    // Flag invalid citations
  }
  ```

- [ ] **Test on real decision letters**
  ```bash
  npm run test:analysis -- --real-data
  ```

**Deliverables:**
- ✅ Groq API integration
- ✅ Schema validation with Zod
- ✅ Repair loop for invalid responses
- ✅ Real analysis with citations
- ✅ Citation verification
- ✅ Tested on 10+ real decision letters
- ✅ Average confidence > 0.8

---

### 1.4 Real Export (Exporter Service)

- [ ] **Install PDF generation libraries**
  ```bash
  cd exporter-service
  npm install marked puppeteer
  npm install @aws-sdk/client-s3
  ```

- [ ] **Implement Markdown → HTML conversion**
  ```typescript
  // src/export/markdown.ts
  import { marked } from 'marked';

  function analysisToMarkdown(analysis: DecisionAnalysis): string {
    return `
  # VA Decision Letter Analysis
  **Document ID:** ${analysis.documentId}

  ## Issues Analyzed
  ${analysis.issues.map(issue => `
  ### ${issue.condition}
  **Decision:** ${issue.decision}
  **Reasoning:** ${issue.reasoning}

  **Citations:**
  ${issue.citations.map(c => `- ${c}`).join('\n')}

  **Recommendations:**
  ${issue.recommendations.map(r => `
  - **${r.action}** (Priority: ${r.priority})
    ${r.reasoning}
  `).join('\n')}

  **Confidence:** ${(issue.confidence * 100).toFixed(0)}%

  ---
  `).join('\n')}
    `;
  }
  ```

- [ ] **Implement HTML → PDF rendering**
  ```typescript
  // src/export/pdf-renderer.ts
  import puppeteer from 'puppeteer';

  async function renderPDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
    });

    await browser.close();
    return pdfBuffer;
  }
  ```

- [ ] **Implement S3 upload for generated PDFs**
  ```typescript
  // src/export/s3-uploader.ts
  import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

  async function uploadPDFToS3(
    documentId: string,
    pdfBuffer: Buffer
  ): Promise<string> {
    const key = `packets/${documentId}/analysis-packet.pdf`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf'
    }));

    return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
  }
  ```

- [ ] **Replace stub endpoint with real export**
  ```typescript
  // src/export/export.controller.ts
  @Post('export')
  async exportDocument(@Body() request: ExportRequest) {
    // Fetch analysis results
    const analysis = await this.getAnalysis(request.documentId);

    // Convert to Markdown
    const markdown = analysisToMarkdown(analysis);

    // Convert to HTML
    const html = marked(markdown);

    // Add CSS styling
    const styledHtml = this.addStyling(html);

    // Render to PDF
    const pdfBuffer = await renderPDF(styledHtml);

    // Upload to S3
    const packetUrl = await uploadPDFToS3(request.documentId, pdfBuffer);

    // Emit event
    await this.emitPacketReady({
      documentId: request.documentId,
      packetUrl,
      format: 'pdf'
    });

    return { packetUrl };
  }
  ```

- [ ] **Test PDF generation quality**
  ```bash
  npm run test:export -- --visual-regression
  ```

**Deliverables:**
- ✅ Markdown generation from analysis
- ✅ HTML rendering with styling
- ✅ PDF generation with Puppeteer
- ✅ S3 upload working
- ✅ Professional-looking PDF output
- ✅ Tested visual quality

---

### 1.5 Real FormReady Bridge (Exporter Service)

- [ ] **Map analysis to VA form fields**
  ```typescript
  // src/bridge/form-mapper.ts
  interface FormFieldMapping {
    formId: string;
    fields: Record<string, any>;
    confidence: Record<string, number>;
  }

  function mapAnalysisToForms(
    analysis: DecisionAnalysis,
    extractedData: DecisionStructured
  ): FormFieldMapping[] {
    const forms: FormFieldMapping[] = [];

    // Determine which forms are needed based on recommendations
    const needsSupplementalClaim = analysis.issues.some(
      i => i.recommendations.some(r => r.action.includes('Supplemental'))
    );

    if (needsSupplementalClaim) {
      forms.push({
        formId: 'va-0995',
        fields: mapTo0995(extractedData, analysis),
        confidence: calculateConfidence(extractedData)
      });
    }

    // ... map to other forms

    return forms;
  }

  function mapTo0995(
    extractedData: DecisionStructured,
    analysis: DecisionAnalysis
  ): Record<string, any> {
    return {
      veteran_first_name: extractedData.veteranInfo.firstName,
      veteran_last_name: extractedData.veteranInfo.lastName,
      ssn: extractedData.veteranInfo.ssn,
      conditions_contested: analysis.issues
        .filter(i => i.decision === 'Denied')
        .map(i => i.condition)
        .join(', '),
      // ... more mappings
    };
  }
  ```

- [ ] **Implement bridge endpoint**
  ```typescript
  // src/bridge/bridge.controller.ts
  @Post('bridge/formready')
  async bridgeToFormReady(@Body() request: BridgeRequest) {
    // Fetch analysis and extracted data
    const analysis = await this.getAnalysis(request.documentId);
    const extractedData = await this.getExtractedData(request.documentId);

    // Map to form fields
    const formMappings = mapAnalysisToForms(analysis, extractedData);

    // For each form, call FormReady API
    const generatedForms = await Promise.all(
      formMappings.map(async mapping => {
        const response = await fetch(
          `${process.env.FORMREADY_API_URL}/api/v1/forms/${mapping.formId}/generate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source: 'analysis',
              documentId: request.documentId,
              data: mapping.fields,
              confidence: mapping.confidence
            })
          }
        );

        const blob = await response.blob();
        // Upload to S3
        const formUrl = await this.uploadFormToS3(
          request.documentId,
          mapping.formId,
          blob
        );

        return { formId: mapping.formId, formUrl };
      })
    );

    return { forms: generatedForms };
  }
  ```

- [ ] **Test form mapping accuracy**
  ```bash
  npm run test:bridge -- --verify-mappings
  ```

**Deliverables:**
- ✅ Analysis → form field mapping
- ✅ Integration with FormReady API
- ✅ Multiple form generation
- ✅ Confidence scores for field mappings
- ✅ Tested on representative cases

---

## Phase 1 Completion Checklist

- [ ] Real PDF extraction working on 20+ test documents
- [ ] Real hybrid retrieval returning relevant results
- [ ] Real Groq analysis with >80% confidence average
- [ ] Real PDF packet generation with professional formatting
- [ ] Real FormReady bridge generating valid forms
- [ ] End-to-end flow tested with real decision letters
- [ ] Error rates < 5% for extraction
- [ ] Retrieval relevance > 90% (manual review)
- [ ] Analysis schema validation > 95% first-try success
- [ ] Generated forms pass VA validation (if available)

**Integration Test:**
```bash
# Upload real decision letter
DOCUMENT_ID=$(curl -F "file=@real-decision.pdf" \
  http://localhost:3000/api/v1/upload | jq -r .documentId)

# Wait for processing
sleep 60

# Fetch results
curl http://localhost:3000/api/v1/documents/$DOCUMENT_ID | jq

# Download packet
curl http://localhost:3000/api/v1/export/$DOCUMENT_ID --output packet.pdf

# Verify forms generated
curl http://localhost:3000/api/v1/bridge/formready \
  -d "{\"documentId\": \"$DOCUMENT_ID\"}" | jq
```

---

## Phase 2: Intelligence & Observability

**Goal:** Add "smarts" and reliability features.

**Success Criteria:** ✅ Fully autonomous, observable system where each service is deployable independently.

### 2.1 Real Local Parser (Parser Service)

- [ ] **Install Ollama**
  ```bash
  # On Railway, use Docker image with Ollama pre-installed
  # Or use Railway volume for model storage
  ```

- [ ] **Pull LLM model**
  ```bash
  ollama pull llama3.2:3b  # Lightweight for parsing
  ```

- [ ] **Implement span detection with Ollama**
  ```python
  # app/parser/ollama-client.py
  import ollama

  async def detect_spans(text: str) -> list:
      prompt = f"""
  Identify and label the following sections in this VA decision letter:
  - veteran_info: Personal information about the veteran
  - rating_decisions: Rating percentages and effective dates
  - denial_reasons: Explanations for denied claims
  - medical_evidence: References to medical records
  - service_connection: Discussion of service connection

  Text:
  {text}

  Return JSON with spans: [{{"type": "...", "start": 0, "end": 100, "content": "..."}}]
  """

      response = ollama.chat(
          model='llama3.2:3b',
          messages=[{'role': 'user', 'content': prompt}],
          format='json'
      )

      return json.loads(response['message']['content'])
  ```

- [ ] **Implement fallback regex patterns**
  ```python
  # app/parser/regex-fallback.py
  FALLBACK_PATTERNS = {
      'veteran_info': r'(?:Veteran|Claimant).*?(?:SSN|Social Security)',
      'rating_decisions': r'(?:RATING|Evaluation).*?(?:\d+%)',
      'denial_reasons': r'(?:denied|not service-connected).*?(?:because|due to)'
  }

  def regex_fallback(text: str) -> list:
      spans = []
      for span_type, pattern in FALLBACK_PATTERNS.items():
          for match in re.finditer(pattern, text, re.IGNORECASE | re.DOTALL):
              spans.append({
                  'type': span_type,
                  'start': match.start(),
                  'end': match.end(),
                  'content': match.group(0)
              })
      return spans
  ```

- [ ] **Replace stub with real implementation**
  ```python
  @app.post("/parse")
  async def parse_document(request: ParseRequest):
      try:
          # Try Ollama first
          spans = await detect_spans(request.text)
      except Exception as e:
          logger.warning(f"Ollama failed: {e}, using regex fallback")
          spans = regex_fallback(request.text)

      # Emit event
      await emit_spans_ready({
          'documentId': request.documentId,
          'spans': spans,
          'method': 'ollama' if spans else 'regex'
      })

      return {'spans': spans}
  ```

- [ ] **Test parsing accuracy**
  ```bash
  pytest tests/test_parser_accuracy.py --benchmark
  ```

**Deliverables:**
- ✅ Ollama integration working
- ✅ Span detection functional
- ✅ Regex fallback in place
- ✅ Parsing accuracy > 85%
- ✅ Processing time < 5s per document

---

### 2.2 Corpus Loader (Real Implementation)

- [ ] **Install corpus processing libraries**
  ```bash
  cd corpus-loader
  poetry add beautifulsoup4 requests lxml
  poetry add sentence-transformers
  ```

- [ ] **Implement CFR 38 scraper**
  ```python
  # app/corpus/cfr38_scraper.py
  import requests
  from bs4 import BeautifulSoup

  async def scrape_cfr38() -> list:
      base_url = "https://www.ecfr.gov/current/title-38"
      # Scrape all parts of CFR 38
      # Parse into structured documents
      # Return list of {citation, content, url}
      pass
  ```

- [ ] **Implement M21-1 scraper**
  ```python
  # app/corpus/m21_scraper.py
  async def scrape_m21() -> list:
      # Scrape M21-1 Manual from VA website
      # Parse into structured sections
      pass
  ```

- [ ] **Implement chunking strategy**
  ```python
  # app/corpus/chunker.py
  def chunk_document(
      content: str,
      chunk_size: int = 512,
      overlap: int = 128
  ) -> list:
      """Split document into overlapping chunks for embedding."""
      chunks = []
      start = 0
      while start < len(content):
          end = start + chunk_size
          chunk = content[start:end]
          chunks.append({
              'content': chunk,
              'start': start,
              'end': end
          })
          start += (chunk_size - overlap)
      return chunks
  ```

- [ ] **Implement embedding generation**
  ```python
  # app/corpus/embedder.py
  from sentence_transformers import SentenceTransformer

  model = SentenceTransformer('all-MiniLM-L6-v2')

  def generate_embeddings(chunks: list) -> list:
      texts = [chunk['content'] for chunk in chunks]
      embeddings = model.encode(texts, show_progress_bar=True)
      return embeddings
  ```

- [ ] **Implement database insertion**
  ```python
  # app/corpus/db-loader.py
  async def load_to_database(documents: list):
      for doc in documents:
          chunks = chunk_document(doc['content'])
          embeddings = generate_embeddings(chunks)

          for chunk, embedding in zip(chunks, embeddings):
              await db.execute("""
                  INSERT INTO corpus_chunks
                  (id, source, citation, content, embedding, metadata)
                  VALUES ($1, $2, $3, $4, $5, $6)
              """,
              uuid4(),
              doc['source'],
              doc['citation'],
              chunk['content'],
              embedding,
              json.dumps(doc.get('metadata', {}))
              )
  ```

- [ ] **Implement versioning**
  ```python
  # app/corpus/versioning.py
  async def create_corpus_revision(source: str) -> str:
      revision = f"{source}-{datetime.now().isoformat()}"

      # Tag all new chunks with revision
      await db.execute("""
          UPDATE corpus_chunks
          SET metadata = metadata || '{"revision": $1}'::jsonb
          WHERE source = $2 AND metadata->>'revision' IS NULL
      """, revision, source)

      return revision
  ```

- [ ] **Replace stub with real implementation**
  ```python
  @app.post("/admin/corpus/ingest")
  async def ingest_corpus(source: str):
      if source == 'CFR38':
          documents = await scrape_cfr38()
      elif source == 'M21-1':
          documents = await scrape_m21()
      else:
          raise ValueError(f"Unknown source: {source}")

      # Load to database
      await load_to_database(documents)

      # Create revision
      revision = await create_corpus_revision(source)

      # Get stats
      stats = await get_corpus_stats(source)

      return {
          'revision': revision,
          'stats': stats,
          'status': 'completed'
      }
  ```

- [ ] **Test corpus loading**
  ```bash
  # Ingest CFR 38
  curl -X POST http://localhost:8003/admin/corpus/ingest?source=CFR38

  # Verify in database
  psql -c "SELECT source, COUNT(*) FROM corpus_chunks GROUP BY source"
  ```

**Deliverables:**
- ✅ CFR 38 scraper working
- ✅ M21-1 scraper working
- ✅ Chunking strategy implemented
- ✅ Embeddings generated
- ✅ Database loading functional
- ✅ Versioning in place
- ✅ >10,000 chunks loaded

---

### 2.3 Real-time Progress (API Gateway Enhancement)

- [ ] **Add page-level progress tracking**
  ```typescript
  // api-gateway/src/realtime/progress-tracker.ts
  interface DocumentProgress {
    documentId: string;
    stage: ProcessingStage;
    currentPage?: number;
    totalPages?: number;
    progress: number;  // 0-100
    message: string;
    startedAt: Date;
    estimatedCompletion?: Date;
  }

  async function updateProgress(update: Partial<DocumentProgress>) {
    await redis.set(
      `progress:${update.documentId}`,
      JSON.stringify(update),
      'EX',
      3600  // Expire after 1 hour
    );

    // Broadcast to SSE
    this.sseService.broadcast(update.documentId, {
      type: 'progress.updated',
      data: update
    });
  }
  ```

- [ ] **Add Groq streaming token support**
  ```typescript
  // analysis-service/src/analysis/streaming.ts
  async function analyzeWithStreaming(request: AnalysisRequest) {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [...],
      stream: true
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) {
        // Emit token to SSE
        await this.emitToken({
          documentId: request.documentId,
          token
        });
      }
    }
  }
  ```

- [ ] **Update SSE to include streaming tokens**
  ```typescript
  // api-gateway/src/realtime/sse.service.ts
  @Sse('documents/:id/status')
  streamStatus(@Param('id') id: string): Observable<MessageEvent> {
    return new Observable(observer => {
      // Subscribe to all event types for this document
      this.redis.subscribe(
        `document:${id}:progress`,
        `document:${id}:token`,
        `document:${id}:error`
      );

      this.redis.on('message', (channel, message) => {
        observer.next({
          data: JSON.parse(message),
          type: channel.split(':').pop()
        });
      });
    });
  }
  ```

- [ ] **Test real-time updates**
  ```bash
  # Connect to SSE
  curl -N http://localhost:3000/api/v1/documents/test-123/status

  # In another terminal, trigger processing
  curl -F "file=@test.pdf" http://localhost:3000/api/v1/upload

  # Should see:
  # - progress.updated events with page numbers
  # - token events during Groq streaming
  # - stage transitions
  ```

**Deliverables:**
- ✅ Page-level progress tracking
- ✅ Groq streaming tokens in SSE
- ✅ Real-time updates < 500ms latency
- ✅ Estimated completion times
- ✅ Tested with concurrent connections

---

### 2.4 Observability (All Services)

- [ ] **Install OpenTelemetry**
  ```bash
  # NestJS services
  npm install @opentelemetry/api @opentelemetry/sdk-node
  npm install @opentelemetry/auto-instrumentations-node

  # Python services
  poetry add opentelemetry-api opentelemetry-sdk
  poetry add opentelemetry-instrumentation-fastapi
  ```

- [ ] **Set up tracing**
  ```typescript
  // src/tracing.ts (NestJS)
  import { NodeSDK } from '@opentelemetry/sdk-node';
  import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

  const sdk = new NodeSDK({
    serviceName: 'api-gateway',
    traceExporter: new ConsoleSpanExporter(),  // Or Jaeger/Tempo
    instrumentations: [getNodeAutoInstrumentations()]
  });

  sdk.start();
  ```

  ```python
  # app/tracing.py (Python)
  from opentelemetry import trace
  from opentelemetry.sdk.trace import TracerProvider
  from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

  trace.set_tracer_provider(TracerProvider())
  FastAPIInstrumentor.instrument_app(app)
  ```

- [ ] **Add correlation IDs**
  ```typescript
  // api-gateway/src/middleware/correlation-id.middleware.ts
  @Injectable()
  export class CorrelationIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: Function) {
      const correlationId = req.headers['x-correlation-id'] || uuidv4();
      req['correlationId'] = correlationId;
      res.setHeader('x-correlation-id', correlationId);
      next();
    }
  }
  ```

- [ ] **Implement RED metrics (Rate, Errors, Duration)**
  ```typescript
  // src/metrics/prometheus.ts
  import { PrometheusModule, makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

  @Module({
    imports: [
      PrometheusModule.register({
        defaultMetrics: { enabled: true }
      })
    ],
    providers: [
      makeCounterProvider({
        name: 'http_requests_total',
        help: 'Total HTTP requests',
        labelNames: ['method', 'route', 'status']
      }),
      makeHistogramProvider({
        name: 'http_request_duration_seconds',
        help: 'HTTP request duration',
        labelNames: ['method', 'route']
      })
    ]
  })
  ```

- [ ] **Add structured logging**
  ```typescript
  // src/logging/logger.ts
  import { Logger } from '@nestjs/common';

  class StructuredLogger extends Logger {
    log(message: string, context?: any) {
      super.log(JSON.stringify({
        level: 'info',
        message,
        timestamp: new Date().toISOString(),
        correlationId: context?.correlationId,
        ...context
      }));
    }
  }
  ```

- [ ] **Set up Dead Letter Queue monitoring**
  ```typescript
  // src/queues/dlq-monitor.ts
  @Injectable()
  export class DLQMonitor {
    @Cron('*/5 * * * *')  // Every 5 minutes
    async checkDLQ() {
      const dlqDepth = await this.queueService.getDLQDepth();

      if (dlqDepth > 10) {
        // Alert administrators
        await this.alertService.send({
          type: 'dlq_threshold_exceeded',
          count: dlqDepth
        });
      }
    }
  }
  ```

- [ ] **Add health checks for all dependencies**
  ```typescript
  // src/health/health.controller.ts
  @Controller('health')
  export class HealthController {
    @Get()
    @HealthCheck()
    check() {
      return this.health.check([
        () => this.db.pingCheck('database'),
        () => this.redis.pingCheck('redis'),
        () => this.s3.check('s3'),
        () => this.disk.checkStorage('disk', { threshold: 90 })
      ]);
    }
  }
  ```

- [ ] **Deploy observability stack (optional)**
  ```yaml
  # docker-compose.observability.yml
  services:
    jaeger:
      image: jaegertracing/all-in-one:latest
      ports:
        - "16686:16686"  # UI
        - "4318:4318"    # OTLP

    prometheus:
      image: prom/prometheus:latest
      volumes:
        - ./prometheus.yml:/etc/prometheus/prometheus.yml
      ports:
        - "9090:9090"

    grafana:
      image: grafana/grafana:latest
      ports:
        - "3001:3000"
  ```

**Deliverables:**
- ✅ OpenTelemetry tracing in all services
- ✅ Correlation IDs across service boundaries
- ✅ RED metrics exported
- ✅ Structured logging
- ✅ DLQ monitoring
- ✅ Health checks comprehensive
- ✅ Dashboards for key metrics (optional)

---

### 2.5 Security (PII Redaction + Auth)

- [ ] **Install PII detection library**
  ```bash
  cd extraction-service
  poetry add presidio-analyzer presidio-anonymizer
  poetry add spacy
  python -m spacy download en_core_web_lg
  ```

- [ ] **Implement PII detection**
  ```python
  # app/security/pii-detector.py
  from presidio_analyzer import AnalyzerEngine
  from presidio_anonymizer import AnonymizerEngine

  analyzer = AnalyzerEngine()
  anonymizer = AnonymizerEngine()

  async def detect_and_redact_pii(text: str) -> tuple[str, dict]:
      # Detect PII
      results = analyzer.analyze(
          text=text,
          language='en',
          entities=['PERSON', 'SSN', 'DATE_OF_BIRTH', 'PHONE_NUMBER', 'EMAIL']
      )

      # Anonymize
      anonymized = anonymizer.anonymize(
          text=text,
          analyzer_results=results,
          operators={'DEFAULT': 'replace'}
      )

      # Store mapping for restoration
      mapping = {
          result.start: {
              'original': text[result.start:result.end],
              'entity_type': result.entity_type,
              'placeholder': anonymized.text[result.start:result.end]
          }
          for result in results
      }

      return anonymized.text, mapping
  ```

- [ ] **Store PII mapping securely**
  ```python
  # app/security/pii-storage.py
  from cryptography.fernet import Fernet

  async def store_pii_mapping(document_id: str, mapping: dict):
      # Encrypt mapping
      key = os.getenv('PII_ENCRYPTION_KEY')
      cipher = Fernet(key)
      encrypted = cipher.encrypt(json.dumps(mapping).encode())

      # Store in Redis with TTL
      await redis.set(
          f"pii_mapping:{document_id}",
          encrypted,
          ex=86400  # 24 hours
      )
  ```

- [ ] **Integrate PII redaction in extraction pipeline**
  ```python
  # app/extraction/pipeline.py
  @app.post("/extract")
  async def extract_document(document_id: str):
      # ... extraction logic ...

      # Redact PII before emitting event
      redacted_text, pii_mapping = await detect_and_redact_pii(extracted_text)

      # Store mapping
      await store_pii_mapping(document_id, pii_mapping)

      # Emit redacted data
      await emit_document_extracted({
          'documentId': document_id,
          'text': redacted_text,  # PII redacted
          'piiRedacted': True
      })
  ```

- [ ] **Restore PII in final output**
  ```python
  # exporter-service/app/export/pii-restore.py
  async def restore_pii(document_id: str, text: str) -> str:
      # Retrieve and decrypt mapping
      encrypted = await redis.get(f"pii_mapping:{document_id}")
      key = os.getenv('PII_ENCRYPTION_KEY')
      cipher = Fernet(key)
      mapping = json.loads(cipher.decrypt(encrypted))

      # Restore original values
      restored = text
      for position, data in sorted(mapping.items(), reverse=True):
          restored = (
              restored[:position] +
              data['original'] +
              restored[position + len(data['placeholder']):]
          )

      return restored
  ```

- [ ] **Add rate limiting**
  ```typescript
  // api-gateway/src/middleware/rate-limit.middleware.ts
  import rateLimit from 'fastify-rate-limit';

  app.register(rateLimit, {
    max: 100,  // 100 requests
    timeWindow: '15 minutes',
    redis: redisClient
  });
  ```

- [ ] **Add API key authentication (optional)**
  ```typescript
  // api-gateway/src/auth/api-key.guard.ts
  @Injectable()
  export class ApiKeyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const apiKey = request.headers['x-api-key'];
      return this.validateApiKey(apiKey);
    }
  }
  ```

- [ ] **Test PII detection accuracy**
  ```bash
  pytest tests/test_pii_detection.py --coverage
  ```

**Deliverables:**
- ✅ PII detection with Presidio
- ✅ Encrypted PII mapping storage
- ✅ Redaction before external LLM calls
- ✅ Restoration in final outputs
- ✅ Rate limiting on all endpoints
- ✅ API key auth (if required)
- ✅ >95% PII detection accuracy

---

### 2.6 Retry & Idempotency

- [ ] **Implement outbox pattern for events**
  ```typescript
  // src/events/outbox.service.ts
  @Injectable()
  export class OutboxService {
    async publishWithOutbox(event: DomainEvent) {
      // Store in outbox table first
      await this.db.execute(`
        INSERT INTO event_outbox (id, type, payload, status)
        VALUES ($1, $2, $3, 'pending')
      `, [event.id, event.type, event.payload]);

      // Publish to event bus
      try {
        await this.eventBus.publish(event);

        // Mark as sent
        await this.db.execute(`
          UPDATE event_outbox SET status = 'sent' WHERE id = $1
        `, [event.id]);
      } catch (error) {
        // Retry later via background worker
        logger.error('Event publish failed, will retry', { eventId: event.id });
      }
    }
  }
  ```

- [ ] **Implement inbox pattern for consumers**
  ```typescript
  // src/events/inbox.service.ts
  @Injectable()
  export class InboxService {
    async processWithInbox(event: DomainEvent, handler: Function) {
      // Check if already processed (idempotency)
      const existing = await this.db.query(`
        SELECT id FROM event_inbox WHERE event_id = $1
      `, [event.id]);

      if (existing.rows.length > 0) {
        logger.info('Event already processed', { eventId: event.id });
        return;
      }

      // Process event
      await handler(event);

      // Record in inbox
      await this.db.execute(`
        INSERT INTO event_inbox (event_id, processed_at)
        VALUES ($1, NOW())
      `, [event.id]);
    }
  }
  ```

- [ ] **Add exponential backoff retry**
  ```typescript
  // src/utils/retry.ts
  async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;

        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  ```

- [ ] **Implement DLQ processing**
  ```typescript
  // src/queues/dlq-processor.ts
  @Injectable()
  export class DLQProcessor {
    @Cron('0 */6 * * *')  // Every 6 hours
    async processDLQ() {
      const failedJobs = await this.queue.getDLQJobs();

      for (const job of failedJobs) {
        // Analyze failure reason
        if (this.isRetriable(job)) {
          // Retry with exponential backoff
          await this.queue.add(job.name, job.data, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 }
          });
        } else {
          // Log permanent failure
          logger.error('Permanent job failure', { job });
        }
      }
    }
  }
  ```

**Deliverables:**
- ✅ Outbox pattern for event publishing
- ✅ Inbox pattern for event processing
- ✅ Idempotent event handlers
- ✅ Exponential backoff retry
- ✅ DLQ monitoring and processing
- ✅ Zero duplicate processing

---

## Phase 2 Completion Checklist

- [ ] Ollama parser deployed and accurate
- [ ] Corpus loaded with >10,000 chunks
- [ ] Real-time progress with page numbers and streaming
- [ ] OpenTelemetry tracing across all services
- [ ] RED metrics exported
- [ ] Structured logging with correlation IDs
- [ ] PII redaction >95% accurate
- [ ] Rate limiting enforced
- [ ] Outbox/Inbox patterns implemented
- [ ] DLQ processing automated
- [ ] System can handle 100 concurrent document uploads
- [ ] Error rate < 2%
- [ ] P95 latency < 30s for full pipeline

**Load Test:**
```bash
# Use k6 or artillery
artillery quick --count 100 --num 10 http://localhost:3000/api/v1/upload

# Monitor:
# - Success rate > 98%
# - No DLQ accumulation
# - All traces complete
# - No PII leaks
```

---

## Phase 3: Enhancements & Scaling

**Goal:** Production-ready platform with ML enhancements and multi-tenant support.

### 3.1 Paragraph-Level Cleaner

- [ ] **Implement layout normalization**
  ```python
  # extraction-service/app/extraction/layout-normalizer.py
  def normalize_layout(text: str) -> str:
      # Remove header/footer repetitions
      # Fix column merges
      # Normalize bullet points
      # Fix hyphenation across lines
      pass
  ```

**Deliverable:** ✅ Clean text extraction improves analysis quality

---

### 3.2 Denial Reason Classifier

- [ ] **Train lightweight classifier**
  ```python
  # Use scikit-learn or MiniLM
  from sklearn.ensemble import RandomForestClassifier

  # Train on labeled denial reasons
  # Categories: insufficient_evidence, lack_of_nexus, service_connection_denied, etc.
  ```

**Deliverable:** ✅ Auto-categorize denial reasons with 90%+ accuracy

---

### 3.3 Corpus Revision Management

- [ ] **Implement corpus diff**
  ```python
  async def diff_corpus_revisions(old_rev: str, new_rev: str):
      # Find added/removed/modified chunks
      # Re-embed only changed chunks
      # Update vector index
      pass
  ```

**Deliverable:** ✅ Incremental corpus updates without full re-index

---

### 3.4 Multi-Tenant Support

- [ ] **Add tenant isolation**
  ```typescript
  // All services add tenantId to requests
  // Database: Row-level security or separate schemas
  // S3: Bucket prefixes per tenant
  ```

**Deliverable:** ✅ Multi-tenant architecture with data isolation

---

### 3.5 API Authentication & Authorization

- [ ] **Implement OAuth2 or API keys**
- [ ] **Add role-based access control**
- [ ] **Usage tracking per tenant**

**Deliverable:** ✅ Secure API with fine-grained permissions

---

## Phase 3 Completion Checklist

- [ ] Layout normalization improves extraction by 15%+
- [ ] Denial classifier 90%+ accuracy
- [ ] Corpus updates without downtime
- [ ] Multi-tenant data isolation verified
- [ ] API auth enforced
- [ ] Usage billing implemented (if required)
- [ ] System scales to 1000+ documents/day
- [ ] Production monitoring dashboards

---

## Summary Table

| Phase | Focus | Duration | Key Deliverables |
|-------|-------|----------|-----------------|
| **0. Skeletons** | Wire all services with stubs | 1-2 weeks | All services deployed, event flow working, SSE updates |
| **1. Deterministic** | Real extraction, retrieval, analysis, export | 3-4 weeks | End-to-end real pipeline, Groq analysis, form generation |
| **2. Intelligence** | Local parser, realtime, observability, security | 2-3 weeks | Ollama parsing, corpus loaded, PII redaction, tracing |
| **3. Enhancement** | ML enrichments, scaling, tenants | 2-3 weeks | Classifiers, multi-tenant, production hardening |

**Total Timeline:** 8-12 weeks to production-ready platform

---

## Service Dependency Graph

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │────────┐
└──────┬──────┘        │
       │               │
       ▼               ▼
┌─────────────┐  ┌──────────────┐
│  Ingestion  │  │ Event Bus    │
└──────┬──────┘  │   (Redis)    │
       │         └───────┬──────┘
       ▼                 │
       📄                │
       │                 │
       ▼                 ▼
┌─────────────┐    ┌────────────┐
│ Extraction  │◄───┤ Outbox/    │
└──────┬──────┘    │ Inbox      │
       │           └────────────┘
       ▼
       📝
       │
       ▼
┌─────────────┐
│   Parser    │
└──────┬──────┘
       │
       ▼
       🏷️
       │
       ▼
┌─────────────┐
│  Retriever  │◄──── Corpus Loader
└──────┬──────┘
       │
       ▼
       📚
       │
       ▼
┌─────────────┐
│  Analysis   │
└──────┬──────┘
       │
       ▼
       🧠
       │
       ▼
┌─────────────┐
│  Exporter   │────► FormReady Bridge
└─────────────┘
       │
       ▼
       📦 (PDF Packet + Forms)
```

---

## Technology Stack

| Layer | Technology | Services |
|-------|------------|----------|
| **Frontend** | Next.js or Nuxt 3 | User interface |
| **API Gateway** | NestJS + Fastify | Request routing, SSE |
| **Business Logic (Node)** | NestJS | Ingestion, Analysis, Orchestrator |
| **Data Processing (Python)** | FastAPI | Extraction, Parser, Retriever, Corpus Loader |
| **Local LLM** | Ollama (llama3.2) | Parser service |
| **External LLM** | Groq (llama-3.3-70b) | Analysis service |
| **Vector Database** | PostgreSQL + pgvector | Retriever service |
| **Document Database** | MongoDB | Metadata storage |
| **Cache/Events** | Redis | Event bus, SSE state, caching |
| **Object Storage** | Railway S3 | PDF storage |
| **Observability** | OpenTelemetry, Prometheus, Grafana | All services |
| **Deployment** | Railway | All services |

---

## Deployment Strategy

### Development
```bash
# Local development with Docker Compose
docker-compose -f docker-compose.dev.yml up

# Services on localhost:
# - API Gateway: 3000
# - Ingestion: 3001
# - Extraction: 8000
# - Parser: 8001
# - Retriever: 8002
# - Analysis: 3002
# - Exporter: 3003
# - Corpus Loader: 8003
```

### Staging
```bash
# Deploy to Railway staging environment
railway environment staging
railway up --service api-gateway
railway up --service ingestion
# ... etc
```

### Production
```bash
# Deploy to Railway production with zero-downtime
railway environment production
railway up --service api-gateway --detach

# Monitor rollout
railway logs --service api-gateway --follow

# Rollback if needed
railway rollback --service api-gateway
```

---

## Next Steps

1. **Week 1-2:** Build contracts repo and API Gateway skeleton
2. **Week 3-4:** Build all service skeletons and wire event bus
3. **Week 5-8:** Implement real extraction, retrieval, and analysis
4. **Week 9-11:** Add intelligence (Ollama, corpus, observability)
5. **Week 12+:** Production hardening and enhancements

**Let's ship it! 🚀**
