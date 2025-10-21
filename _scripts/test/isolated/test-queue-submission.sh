#!/bin/bash

# Test NestJS queue submission in isolation
# Tests BullMQ job creation without waiting for processing

echo "🧪 Testing NestJS Queue Submission (Isolated)"
echo ""

# Check if NestJS API is running
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
  echo "❌ NestJS API not running on port 3001"
  echo "   Start it with: cd refinery-api && npm run start:dev"
  exit 1
fi

echo "✅ NestJS API is running"
echo ""

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
  echo "❌ Redis not running"
  echo "   Start it with: redis-server"
  exit 1
fi

echo "✅ Redis is running"
echo ""

# Test 1: Health check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: API Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HEALTH=$(curl -s http://localhost:3001/health)
if echo "$HEALTH" | jq -e '.status == "ok"' > /dev/null 2>&1; then
  echo "✅ PASS: Health endpoint responding"
  echo "$HEALTH" | jq
else
  echo "❌ FAIL: Health endpoint not working"
  exit 1
fi

echo ""

# Test 2: Submit job to queue
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Submit Document Extracted Job"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DOCID="queue-test-$(date +%s)"
echo "Document ID: $DOCID"
echo ""

# Create mock extraction data
EXTRACTION_DATA=$(cat <<EOF
{
  "documentId": "$DOCID",
  "extractedAt": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")",
  "veteranInfo": {
    "firstName": "TEST",
    "lastName": "USER",
    "ssn": "XXX-XX-XXXX"
  },
  "ratings": [
    {
      "condition": "Test Condition",
      "decision": "granted",
      "ratingPercentage": 50
    }
  ],
  "denialReasons": [],
  "rawText": "Test raw text",
  "piiRedacted": true,
  "extractionMetadata": {
    "method": "test",
    "confidence": 0.99,
    "pageCount": 1,
    "processingTimeMs": 0
  }
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/internal/queue/document-extracted \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOCID\",\"extractionData\":$EXTRACTION_DATA}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "202" ]; then
  echo "✅ PASS: Job accepted (HTTP 202)"
  echo "$BODY" | jq
else
  echo "❌ FAIL: Expected HTTP 202, got $HTTP_CODE"
  echo "$BODY" | jq
  exit 1
fi

echo ""

# Test 3: Check queue stats via Redis
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Check BullMQ Queue Stats"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

WAITING=$(redis-cli LLEN bull:pipeline-queue:waiting 2>/dev/null || echo "0")
ACTIVE=$(redis-cli LLEN bull:pipeline-queue:active 2>/dev/null || echo "0")
COMPLETED=$(redis-cli LLEN bull:pipeline-queue:completed 2>/dev/null || echo "0")
FAILED=$(redis-cli LLEN bull:pipeline-queue:failed 2>/dev/null || echo "0")

echo "Queue Stats:"
echo "  Waiting: $WAITING"
echo "  Active: $ACTIVE"
echo "  Completed: $COMPLETED"
echo "  Failed: $FAILED"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo "✅ PASS: No failed jobs"
else
  echo "⚠️  WARNING: $FAILED failed jobs in queue"
fi

echo ""

# Test 4: Invalid payload (missing required fields)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Error Handling (Invalid Payload)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/internal/queue/document-extracted \
  -H "Content-Type: application/json" \
  -d '{}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "500" ]; then
  echo "✅ PASS: Error returned for invalid payload (HTTP $HTTP_CODE)"
else
  echo "❌ FAIL: Should return error for invalid payload, got HTTP $HTTP_CODE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Queue Submission Tests Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
