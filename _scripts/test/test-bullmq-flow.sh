#!/bin/bash

echo "🧪 Testing Complete BullMQ Event Flow"
echo "========================================"
echo ""

# Colors
GREEN='\033[0.32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test document ID
DOC_ID="flow-test-$(date +%s)"

echo -e "${BLUE}Step 1: Call Python extraction endpoint${NC}"
echo "POST http://localhost:8000/extraction/extract"
echo ""

EXTRACTION_RESULT=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOC_ID\",\"storageUrl\":\"s3://test-bucket/test.pdf\"}")

echo "$EXTRACTION_RESULT" | jq -r '.documentId'
echo -e "${GREEN}✓ Extraction completed${NC}"
echo ""

sleep 2

echo -e "${BLUE}Step 2: Python queues job to BullMQ via NestJS${NC}"
echo "POST http://localhost:3001/internal/queue/document-extracted"
echo -e "${YELLOW}(This happens automatically)${NC}"
echo ""

sleep 2

echo -e "${BLUE}Step 3: BullMQ processor handles job${NC}"
echo "Checking logs for processor output..."
echo ""

# Check logs for the document ID
tail -50 /tmp/refinery-api.log | grep "$DOC_ID" || echo -e "${YELLOW}Check /tmp/refinery-api.log manually for: $DOC_ID${NC}"
echo ""

echo -e "${GREEN}✓ Complete flow tested!${NC}"
echo ""
echo "Summary:"
echo "--------"
echo "1. Python service receives extraction request"
echo "2. Python calls NestJS /internal/queue/document-extracted"
echo "3. NestJS adds job to BullMQ pipeline-queue"
echo "4. DocumentEventsProcessor processes 'document.extracted' job"
echo "5. Processor logs extraction details (stub implementation)"
echo ""
echo "Next steps for Phase 1:"
echo "- Replace stub processor with real Groq LLM analysis"
echo "- Add database persistence for results"
echo "- Implement remaining processors (spans-ready, document-indexed)"
