# Test Scripts

Manual testing scripts for the Refinery Platform.

## Quick Start

```bash
# Health check all services
./test-health.sh

# Test basic flow (single document)
./test-basic-flow.sh

# Test concurrent processing (5 documents)
./test-multiple-docs.sh

# Test with real PDF
./test-real-pdf.sh ~/path/to/va-decision.pdf

# Performance benchmark (10 iterations)
./test-performance.sh
```

## Available Scripts

### `test-health.sh`
Checks if all services are running:
- Redis
- MongoDB
- NestJS API (port 3001)
- Python Service (port 8000)

### `test-basic-flow.sh`
Tests complete end-to-end flow:
1. Submit extraction request
2. Wait for Groq analysis (3s)
3. Retrieve complete document
4. Verify MongoDB storage

### `test-multiple-docs.sh`
Tests concurrent processing:
- Submits 5 documents in parallel
- Waits for all to complete
- Checks success rate

### `test-real-pdf.sh <pdf-path>`
Tests with real VA decision letter:
- Uses Docling for extraction
- Verifies PII redaction
- Checks Groq analysis accuracy

Requires: Path to PDF file as argument

### `test-performance.sh`
Performance benchmark:
- Processes 10 documents
- Measures total time and LLM time
- Calculates average, min, max

## Full Documentation

See root directory for comprehensive guides:
- `MANUAL-TESTING-GUIDE.md` - Detailed testing procedures
- `TESTING-RESULTS.md` - Latest test results and findings

## Prerequisites

All services must be running. Start them with:

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: MongoDB
mongod --dbpath ~/data/db

# Terminal 3: NestJS API
cd refinery-api && npm run start:dev

# Terminal 4: Python Service
cd refinery-python && uvicorn main:app --reload --port 8000
```

## Expected Results

All tests should pass with:
- ✅ Health check: All services responding
- ✅ Basic flow: < 2s processing time
- ✅ Concurrent: 5/5 documents successful
- ✅ Performance: < 3.5s average
