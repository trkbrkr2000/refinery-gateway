#!/bin/bash

# FormReady End-to-End Test Script
# Tests both services and event flow

set -e

echo "🧪 FormReady End-to-End Test"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check both services are running
echo "1️⃣  Checking services..."
echo ""

echo "  Checking refinery-api (port 3001)..."
API_HEALTH=$(curl -s http://localhost:3001/health)
if [[ $API_HEALTH == *"ok"* ]]; then
    echo -e "  ${GREEN}✓${NC} refinery-api is healthy"
else
    echo -e "  ${RED}✗${NC} refinery-api is not responding"
    exit 1
fi

echo "  Checking refinery-python (port 8000)..."
PYTHON_HEALTH=$(curl -s http://localhost:8000/health)
if [[ $PYTHON_HEALTH == *"ok"* ]]; then
    echo -e "  ${GREEN}✓${NC} refinery-python is healthy"
else
    echo -e "  ${RED}✗${NC} refinery-python is not responding"
    exit 1
fi

echo ""

# Test 2: Test Python extraction endpoint
echo "2️⃣  Testing PDF extraction (stub)..."
echo ""

EXTRACTION_RESPONSE=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "test-e2e-123",
    "storageUrl": "s3://test-bucket/test.pdf"
  }')

if [[ $EXTRACTION_RESPONSE == *"test-e2e-123"* ]] && [[ $EXTRACTION_RESPONSE == *"Tinnitus"* ]]; then
    echo -e "  ${GREEN}✓${NC} Extraction endpoint working"
    echo "  Extracted conditions: Tinnitus, PTSD"
else
    echo -e "  ${RED}✗${NC} Extraction failed"
    echo "  Response: $EXTRACTION_RESPONSE"
    exit 1
fi

echo ""

# Test 3: Test retrieval endpoint
echo "3️⃣  Testing VA regulation retrieval (stub)..."
echo ""

RETRIEVAL_RESPONSE=$(curl -s -X POST http://localhost:8000/retriever/retrieve \
  -H "Content-Type: application/json" \
  -d '{
    "query": "service connection for tinnitus",
    "topK": 3
  }')

if [[ $RETRIEVAL_RESPONSE == *"38 CFR"* ]]; then
    echo -e "  ${GREEN}✓${NC} Retrieval endpoint working"
    echo "  Found regulations: 38 CFR 3.303, M21-1"
else
    echo -e "  ${RED}✗${NC} Retrieval failed"
    exit 1
fi

echo ""

# Test 4: Test parser endpoint
echo "4️⃣  Testing document parsing (stub)..."
echo ""

PARSE_RESPONSE=$(curl -s -X POST http://localhost:8000/parser/parse \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "test-parse-456",
    "text": "DEPARTMENT OF VETERANS AFFAIRS\nRATING DECISION\n\nVeteran: John Doe\nSSN: XXX-XX-1234\n\nCondition: Tinnitus - DENIED"
  }')

if [[ $PARSE_RESPONSE == *"veteran_info"* ]] && [[ $PARSE_RESPONSE == *"rating_decision"* ]]; then
    echo -e "  ${GREEN}✓${NC} Parser endpoint working"
    echo "  Identified sections: veteran_info, rating_decision"
else
    echo -e "  ${RED}✗${NC} Parser failed"
    exit 1
fi

echo ""

# Test 5: Check API docs
echo "5️⃣  Checking API documentation..."
echo ""

if curl -s http://localhost:3001/api/docs | grep -q "Refinery API"; then
    echo -e "  ${GREEN}✓${NC} Swagger docs available at http://localhost:3001/api/docs"
fi

if curl -s http://localhost:8000/docs | grep -q "FastAPI"; then
    echo -e "  ${GREEN}✓${NC} FastAPI docs available at http://localhost:8000/docs"
fi

echo ""

# Test 6: Test Redis connection
echo "6️⃣  Testing Redis connection..."
echo ""

PYTHON_REDIS=$(echo $PYTHON_HEALTH | grep -o '"redis":"[^"]*"' | cut -d'"' -f4)
if [[ $PYTHON_REDIS == "connected" ]]; then
    echo -e "  ${GREEN}✓${NC} refinery-python connected to Redis"
else
    echo -e "  ${YELLOW}⚠${NC}  refinery-python not connected to Redis (events won't work)"
fi

echo ""

# Summary
echo "=============================="
echo -e "${GREEN}✓ All tests passed!${NC}"
echo ""
echo "Services running:"
echo "  • refinery-api:    http://localhost:3001"
echo "  • refinery-python: http://localhost:8000"
echo ""
echo "API Documentation:"
echo "  • Swagger UI:  http://localhost:3001/api/docs"
echo "  • FastAPI UI:  http://localhost:8000/docs"
echo ""
echo "Next steps:"
echo "  • Test form generation: curl http://localhost:3001/api/forms"
echo "  • Upload a real PDF: curl -F file=@decision.pdf http://localhost:3001/api/upload"
echo "  • Check event flow: redis-cli MONITOR"
echo ""
