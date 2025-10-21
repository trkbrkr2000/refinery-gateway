#!/bin/bash

# Test Python extraction service in isolation
# Tests both stub and real Docling extraction

echo "🧪 Testing Python Extraction Service (Isolated)"
echo ""

# Check if Python service is running
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
  echo "❌ Python service not running on port 8000"
  echo "   Start it with: cd refinery-python && uvicorn main:app --reload --port 8000"
  exit 1
fi

echo "✅ Python service is running"
echo ""

# Test 1: Health check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HEALTH=$(curl -s http://localhost:8000/health)
if echo "$HEALTH" | jq -e '.status == "ok"' > /dev/null 2>&1; then
  echo "✅ PASS: Health endpoint responding"
  echo "$HEALTH" | jq
else
  echo "❌ FAIL: Health endpoint not working"
  exit 1
fi

echo ""

# Test 2: Stub extraction (S3 URL)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Stub Extraction (S3 URL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DOCID="stub-test-$(date +%s)"
echo "Document ID: $DOCID"
echo "Storage URL: s3://test-bucket/decision.pdf"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"s3://test-bucket/decision.pdf\"}")

# Check response structure
if echo "$RESPONSE" | jq -e '.documentId' > /dev/null 2>&1; then
  METHOD=$(echo "$RESPONSE" | jq -r '.extractionMetadata.method')
  RATINGS=$(echo "$RESPONSE" | jq -r '.ratings | length')
  PII=$(echo "$RESPONSE" | jq -r '.piiRedacted')

  if [ "$METHOD" = "stub" ]; then
    echo "✅ PASS: Stub data returned"
    echo "   Method: $METHOD"
    echo "   Ratings: $RATINGS"
    echo "   PII Redacted: $PII"
  else
    echo "❌ FAIL: Expected stub method, got: $METHOD"
    exit 1
  fi
else
  echo "❌ FAIL: Invalid response structure"
  echo "$RESPONSE" | jq
  exit 1
fi

echo ""

# Test 3: Real extraction with Docling (if PDF available)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Real Extraction with Docling"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for test PDF in common locations
TEST_PDF=""
for path in \
  ~/Documents/va-decision.pdf \
  ~/Downloads/va-decision.pdf \
  ./test-data/va-decision.pdf \
  /tmp/va-decision.pdf
do
  if [ -f "$path" ]; then
    TEST_PDF="$path"
    break
  fi
done

if [ -z "$TEST_PDF" ]; then
  echo "⚠️  SKIP: No test PDF found"
  echo "   Place a VA decision PDF at:"
  echo "   - ~/Documents/va-decision.pdf"
  echo "   - ~/Downloads/va-decision.pdf"
  echo "   Or provide path as first argument"
  if [ -n "$1" ] && [ -f "$1" ]; then
    TEST_PDF="$1"
    echo ""
    echo "   Using provided file: $TEST_PDF"
  fi
fi

if [ -n "$TEST_PDF" ]; then
  echo "PDF: $TEST_PDF"
  DOCID="docling-test-$(date +%s)"
  echo "Document ID: $DOCID"
  echo ""

  RESPONSE=$(curl -s -X POST http://localhost:8000/extraction/extract \
    -H "Content-Type: application/json" \
    -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"file://$TEST_PDF\"}")

  if echo "$RESPONSE" | jq -e '.documentId' > /dev/null 2>&1; then
    METHOD=$(echo "$RESPONSE" | jq -r '.extractionMetadata.method')
    PAGES=$(echo "$RESPONSE" | jq -r '.extractionMetadata.pageCount')
    CONFIDENCE=$(echo "$RESPONSE" | jq -r '.extractionMetadata.confidence')

    if [ "$METHOD" = "docling" ]; then
      echo "✅ PASS: Docling extraction successful"
      echo "   Method: $METHOD"
      echo "   Pages: $PAGES"
      echo "   Confidence: $CONFIDENCE"
      echo ""
      echo "   Veteran Info:"
      echo "$RESPONSE" | jq -r '   "     First Name: \(.veteranInfo.firstName)"'
      echo "$RESPONSE" | jq -r '   "     Last Name: \(.veteranInfo.lastName)"'
      echo "$RESPONSE" | jq -r '   "     SSN: \(.veteranInfo.ssn)"'
      echo ""
      echo "   Ratings:"
      echo "$RESPONSE" | jq -r '.ratings[] | "     - \(.condition): \(.decision) \(if .ratingPercentage then "(\(.ratingPercentage)%)" else "" end)"'
    else
      echo "❌ FAIL: Expected docling method, got: $METHOD"
      echo "   (File might not exist or Docling failed)"
    fi
  else
    echo "❌ FAIL: Invalid response"
    echo "$RESPONSE" | jq
    exit 1
  fi
fi

echo ""

# Test 4: Invalid input (missing documentId)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Error Handling (Invalid Input)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d '{"storageUrl":"s3://test/doc.pdf"}')

if echo "$RESPONSE" | jq -e '.detail' > /dev/null 2>&1; then
  echo "✅ PASS: Error returned for invalid input"
  echo "$RESPONSE" | jq -r '"   Error: \(.detail[0].msg)"'
else
  echo "❌ FAIL: Should return validation error"
  echo "$RESPONSE" | jq
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Python Extraction Service Tests Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
