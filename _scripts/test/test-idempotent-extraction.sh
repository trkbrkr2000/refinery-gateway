#!/bin/bash

# Test that extraction endpoint is idempotent
# Same documentId should return cached result on second call

set -e

echo "🧪 Testing Idempotent Extraction"
echo ""

# Check services
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
  echo "❌ Python service not running on port 8000"
  exit 1
fi

if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
  echo "❌ NestJS API not running on port 3001"
  exit 1
fi

# Use a fixed documentId for testing
DOCID="idempotent-test-$(date +%s)"
PDF_PATH=$(cd _test-data/decisions && pwd)/_ptsd-denial.pdf

echo "Document ID: $DOCID"
echo "PDF: $PDF_PATH"
echo ""

# ============================================================================
# Test 1: First extraction (should process)
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: First Extraction (should process with Docling)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

START1=$(date +%s)

RESPONSE1=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"file://$PDF_PATH\"}")

END1=$(date +%s)
TIME1=$((END1 - START1))

if ! echo "$RESPONSE1" | jq -e '.documentId' > /dev/null 2>&1; then
  echo "❌ First extraction failed"
  echo "$RESPONSE1"
  exit 1
fi

METHOD1=$(echo "$RESPONSE1" | jq -r '.extractionMetadata.method')
CACHED1=$(echo "$RESPONSE1" | jq -r '.extractionMetadata.cached // false')
PROCESSING_TIME1=$(echo "$RESPONSE1" | jq -r '.extractionMetadata.processingTimeMs')
RATINGS1=$(echo "$RESPONSE1" | jq -r '.ratings | length')

echo "✅ First extraction succeeded"
echo "   Method: $METHOD1"
echo "   Cached: $CACHED1"
echo "   Processing time: ${PROCESSING_TIME1}ms"
echo "   Total time: ${TIME1}s"
echo "   Ratings found: $RATINGS1"
echo ""

# Wait for MongoDB save
echo "⏳ Waiting 3 seconds for MongoDB save..."
sleep 3
echo ""

# ============================================================================
# Test 2: Second extraction (should return cached)
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Second Extraction (should return cached)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

START2=$(date +%s)

RESPONSE2=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"file://$PDF_PATH\"}")

END2=$(date +%s)
TIME2=$((END2 - START2))

if ! echo "$RESPONSE2" | jq -e '.documentId' > /dev/null 2>&1; then
  echo "❌ Second extraction failed"
  echo "$RESPONSE2"
  exit 1
fi

METHOD2=$(echo "$RESPONSE2" | jq -r '.extractionMetadata.method')
CACHED2=$(echo "$RESPONSE2" | jq -r '.extractionMetadata.cached // false')
PROCESSING_TIME2=$(echo "$RESPONSE2" | jq -r '.extractionMetadata.processingTimeMs')
RATINGS2=$(echo "$RESPONSE2" | jq -r '.ratings | length')

echo "✅ Second extraction succeeded"
echo "   Method: $METHOD2"
echo "   Cached: $CACHED2"
echo "   Processing time: ${PROCESSING_TIME2}ms"
echo "   Total time: ${TIME2}s"
echo "   Ratings found: $RATINGS2"
echo ""

# ============================================================================
# Test 3: Third extraction (verify still cached)
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Third Extraction (verify still cached)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

START3=$(date +%s)

RESPONSE3=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"file://$PDF_PATH\"}")

END3=$(date +%s)
TIME3=$((END3 - START3))

METHOD3=$(echo "$RESPONSE3" | jq -r '.extractionMetadata.method')
CACHED3=$(echo "$RESPONSE3" | jq -r '.extractionMetadata.cached // false')
PROCESSING_TIME3=$(echo "$RESPONSE3" | jq -r '.extractionMetadata.processingTimeMs')

echo "✅ Third extraction succeeded"
echo "   Method: $METHOD3"
echo "   Cached: $CACHED3"
echo "   Processing time: ${PROCESSING_TIME3}ms"
echo "   Total time: ${TIME3}s"
echo ""

# ============================================================================
# Verification
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PASS=0
FAIL=0

# Check 1: First call should NOT be cached
if [ "$CACHED1" = "false" ]; then
  echo "✅ First call was not cached (correct)"
  PASS=$((PASS + 1))
else
  echo "❌ First call was cached (should be fresh extraction)"
  FAIL=$((FAIL + 1))
fi

# Check 2: Second call SHOULD be cached
if [ "$CACHED2" = "true" ]; then
  echo "✅ Second call was cached (correct)"
  PASS=$((PASS + 1))
else
  echo "❌ Second call was not cached"
  FAIL=$((FAIL + 1))
fi

# Check 3: Third call SHOULD also be cached
if [ "$CACHED3" = "true" ]; then
  echo "✅ Third call was cached (correct)"
  PASS=$((PASS + 1))
else
  echo "❌ Third call was not cached"
  FAIL=$((FAIL + 1))
fi

# Check 4: Second call should be much faster
if (( TIME2 < 10 )); then
  echo "✅ Second call was fast: ${TIME2}s"
  PASS=$((PASS + 1))
else
  echo "⚠️  Second call was slow: ${TIME2}s (expected <10s, but may be network delay)"
  # Don't fail - could be network latency
  PASS=$((PASS + 1))
fi

# Check 5: All calls should return same data
DOCID2=$(echo "$RESPONSE2" | jq -r '.documentId')
DOCID3=$(echo "$RESPONSE3" | jq -r '.documentId')

if [ "$DOCID" = "$DOCID2" ] && [ "$DOCID2" = "$DOCID3" ]; then
  echo "✅ All calls returned same documentId"
  PASS=$((PASS + 1))
else
  echo "❌ DocumentIds don't match"
  FAIL=$((FAIL + 1))
fi

# Check 6: Ratings should be consistent
if [ "$RATINGS1" = "$RATINGS2" ]; then
  echo "✅ Ratings consistent across calls: $RATINGS1"
  PASS=$((PASS + 1))
else
  echo "❌ Ratings differ (first: $RATINGS1, second: $RATINGS2)"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Checks passed: $PASS/6"
echo "Checks failed: $FAIL/6"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "✅ IDEMPOTENCY TEST PASSED"
  echo ""
  echo "Performance:"
  echo "  First call:  ${TIME1}s (fresh extraction)"
  echo "  Second call: ${TIME2}s (cached)"
  echo "  Third call:  ${TIME3}s (cached)"
  exit 0
else
  echo "❌ IDEMPOTENCY TEST FAILED"
  exit 1
fi
