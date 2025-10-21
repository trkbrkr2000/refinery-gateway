#!/bin/bash

# Isolated Component Tests

Test each component of the Refinery Platform independently.

## Quick Start

```bash
# Run all tests
./run-all.sh

# Run all tests (quick mode - skips Groq)
./run-all.sh --quick

# Continue even if tests fail
CONTINUE_ON_FAIL=1 ./run-all.sh

# Run individual tests
./test-python-extraction.sh
./test-queue-submission.sh
./test-groq-llm.sh
./test-mongodb.sh
./test-redis-queue.sh
```

---

## Available Tests

### 1. Redis & BullMQ Queue (`test-redis-queue.sh`)

**Tests:**
- Redis connection (PING/PONG)
- BullMQ queue keys exist
- Queue statistics (waiting, active, completed, failed)
- Memory usage
- Job data structure

**No Dependencies**
**Duration:** < 1 second

---

### 2. MongoDB Operations (`test-mongodb.sh`)

**Tests:**
- Database connection
- Collections exist (document_extractions, analysis_results)
- Indexes created
- Document counts
- Data integrity (extraction ↔ analysis linking)
- Query performance

**No Dependencies**
**Duration:** < 2 seconds

---

### 3. Python Extraction Service (`test-python-extraction.sh`)

**Tests:**
- Health endpoint
- Stub extraction (S3 URLs)
- Real extraction with Docling (local files)
- Error handling (invalid input)

**Requires:** Python service running on port 8000
**Duration:** 1-3 seconds

**Real Extraction:**
To test Docling extraction, provide a PDF path:
```bash
./test-python-extraction.sh ~/Documents/va-decision.pdf
```

---

### 4. NestJS Queue Submission (`test-queue-submission.sh`)

**Tests:**
- API health check
- Submit job to BullMQ
- Check queue stats via Redis
- Error handling (invalid payload)

**Requires:**
- NestJS API running on port 3001
- Redis running

**Duration:** < 1 second

---

### 5. Groq LLM Service (`test-groq-llm.sh`)

**Tests:**
- Submit extraction data
- Wait for Groq analysis
- Verify analysis quality (summary, conditions, evidence)
- Check response time

**Requires:**
- NestJS API running
- Redis running
- MongoDB running
- GROQ_API_KEY configured

**Duration:** ~5 seconds (includes waiting for Groq)

**Note:** This test runs through the full pipeline to test Groq.
For true isolation, create a unit test that calls GroqService directly.

---

## Test Architecture

```
Infrastructure Tests (No Dependencies)
├── test-redis-queue.sh      ✅ Redis & BullMQ
└── test-mongodb.sh           ✅ MongoDB

Service Tests (Require Infrastructure)
├── test-python-extraction.sh ✅ Python FastAPI
└── test-queue-submission.sh  ✅ NestJS endpoints

Integration Tests (Require Everything)
└── test-groq-llm.sh          ✅ Full pipeline with AI
```

---

## Prerequisites

### Required Services

```bash
# Redis
redis-server

# MongoDB
mongod --dbpath ~/data/db

# Python Service
cd refinery-python
uvicorn main:app --reload --port 8000

# NestJS API
cd refinery-api
npm run start:dev
```

### Check All Services

```bash
# From repo root
./_scripts/test/test-health.sh
```

---

## Test Output

Each test shows:
- ✅ PASS - Test succeeded
- ❌ FAIL - Test failed (stops execution unless CONTINUE_ON_FAIL=1)
- ⚠️ WARNING - Non-critical issue
- ⏩ SKIP - Test skipped (dependency missing or --quick mode)

Example:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEST 1: Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PASS: Health endpoint responding
{
  "status": "ok",
  "service": "refinery-python",
  "version": "0.1.0"
}
```

---

## What Each Test Validates

### Python Extraction (`test-python-extraction.sh`)
- ✅ FastAPI server responding
- ✅ Stub data generation (for S3 URLs)
- ✅ Docling extraction (for local files)
- ✅ Input validation
- ✅ Error responses

### Queue Submission (`test-queue-submission.sh`)
- ✅ Job submission via HTTP
- ✅ BullMQ accepts jobs
- ✅ Redis queue updates
- ✅ HTTP 202 Accepted responses
- ✅ Error handling for invalid payloads

### Groq LLM (`test-groq-llm.sh`)
- ✅ End-to-end pipeline works
- ✅ Groq API integration
- ✅ Analysis quality (2+ conditions, summary generated)
- ✅ Response time tracking
- ✅ MongoDB storage

### MongoDB (`test-mongodb.sh`)
- ✅ Database connectivity
- ✅ Collections created
- ✅ Indexes exist
- ✅ Extraction ↔ Analysis linking
- ✅ Query performance

### Redis/Queue (`test-redis-queue.sh`)
- ✅ Redis connectivity
- ✅ BullMQ queue structure
- ✅ Job counts (waiting, active, completed, failed)
- ✅ Memory usage
- ✅ Job data integrity

---

## Troubleshooting

### Test Fails: "Service not running"
```bash
# Check which services are down
./_scripts/test/test-health.sh

# Start missing services
redis-server &
mongod --dbpath ~/data/db &
cd refinery-python && uvicorn main:app --reload --port 8000 &
cd refinery-api && npm run start:dev &
```

### Test Fails: "Connection refused"
- Check service ports (3001 for NestJS, 8000 for Python)
- Verify no other services using those ports
- Check firewall settings

### Test Fails: "Groq API error"
- Verify GROQ_API_KEY in `refinery-api/.env`
- Check API key has credits/is valid
- Test with: `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"`

### Test Fails: "MongoDB not found"
- Check database name is "refinery"
- Verify MongoDB is running: `mongosh --eval "db.adminCommand('ping')"`
- Check connection string in `refinery-api/.env`

---

## Adding New Tests

To add a new isolated test:

1. Create `test-your-component.sh` in this directory
2. Follow the template:
```bash
#!/bin/bash

echo "🧪 Testing Your Component (Isolated)"
echo ""

# Check prerequisites
if ! curl -s http://localhost:PORT/health > /dev/null 2>&1; then
  echo "❌ Service not running"
  exit 1
fi

# Test 1
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Description"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test logic here
if [ condition ]; then
  echo "✅ PASS: Test succeeded"
else
  echo "❌ FAIL: Test failed"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Your Component Tests Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

3. Make it executable: `chmod +x test-your-component.sh`
4. Add to `run-all.sh`

---

## CI/CD Integration

These tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Isolated Tests
  run: |
    # Start services
    redis-server &
    mongod --dbpath /tmp/db &

    # Run tests
    ./_scripts/test/isolated/run-all.sh --quick
```

---

## Performance Benchmarks

Expected test durations:
- Redis/Queue: < 1s
- MongoDB: < 2s
- Python Extraction: 1-3s
- Queue Submission: < 1s
- Groq LLM: ~5s

Total: ~10 seconds for all tests

---

## Related Documentation

- [MANUAL-TESTING-GUIDE.md](../../../MANUAL-TESTING-GUIDE.md) - Comprehensive testing guide
- [TESTING-RESULTS.md](../../../TESTING-RESULTS.md) - Latest test results
- [FLOW-ANALYSIS.md](../../../FLOW-ANALYSIS.md) - What's real vs stubbed
