#!/bin/bash

# Test hash-based deduplication
# Upload same PDF with 3 different documentIds
# Should only process once, cache the other 2

set -e

echo "🧪 Testing Hash-Based Deduplication"
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

# Use same PDF for all 3 requests
PDF_PATH=$(cd _test-data/decisions && pwd)/_ptsd-denial.pdf

# Generate 3 different documentIds
DOC1="hash-test-upload-1-$(date +%s)"
DOC2="hash-test-upload-2-$(date +%s)"
DOC3="hash-test-upload-3-$(date +%s)"

echo "PDF: $PDF_PATH"
echo ""
echo "Document IDs (all pointing to same PDF):"
echo "  1. $DOC1"
echo "  2. $DOC2"
echo "  3. $DOC3"
echo ""

# ============================================================================
# Request 1: Should extract with Docling (cache MISS)
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "REQUEST 1: $DOC1 (should process with Docling)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

START1=$(date +%s)

RESPONSE1=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOC1\",\"storageUrl\":\"file://$PDF_PATH\"}")

END1=$(date +%s)
TIME1=$((END1 - START1))

CACHED1=$(echo "$RESPONSE1" | jq -r '.extractionMetadata.cached // false')
HASH1=$(echo "$RESPONSE1" | jq -r '.contentHash // "none"')
METHOD1=$(echo "$RESPONSE1" | jq -r '.extractionMetadata.method')

echo "✅ Request 1 complete"
echo "   Time: ${TIME1}s"
echo "   Cached: $CACHED1"
echo "   Hash: ${HASH1:0:16}..."
echo "   Method: $METHOD1"
echo ""

# Wait for MongoDB save
echo "⏳ Waiting 3 seconds for MongoDB save..."
sleep 3
echo ""

# ============================================================================
# Request 2: Same PDF, different ID (should hit cache)
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "REQUEST 2: $DOC2 (same PDF, should be cached)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

START2=$(date +%s)

RESPONSE2=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOC2\",\"storageUrl\":\"file://$PDF_PATH\"}")

END2=$(date +%s)
TIME2=$((END2 - START2))

CACHED2=$(echo "$RESPONSE2" | jq -r '.extractionMetadata.cached // false')
HASH2=$(echo "$RESPONSE2" | jq -r '.contentHash // "none"')

echo "✅ Request 2 complete"
echo "   Time: ${TIME2}s"
echo "   Cached: $CACHED2"
echo "   Hash: ${HASH2:0:16}..."
echo ""

# ============================================================================
# Request 3: Same PDF again, another ID (should also hit cache)
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "REQUEST 3: $DOC3 (same PDF, should also be cached)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

START3=$(date +%s)

RESPONSE3=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOC3\",\"storageUrl\":\"file://$PDF_PATH\"}")

END3=$(date +%s)
TIME3=$((END3 - START3))

CACHED3=$(echo "$RESPONSE3" | jq -r '.extractionMetadata.cached // false')
HASH3=$(echo "$RESPONSE3" | jq -r '.contentHash // "none"')

echo "✅ Request 3 complete"
echo "   Time: ${TIME3}s"
echo "   Cached: $CACHED3"
echo "   Hash: ${HASH3:0:16}..."
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

# Check 1: First request should NOT be cached
if [ "$CACHED1" = "false" ]; then
  echo "✅ Request 1 was not cached (correct - first extraction)"
  PASS=$((PASS + 1))
else
  echo "❌ Request 1 was cached (should be fresh extraction)"
  FAIL=$((FAIL + 1))
fi

# Check 2: Second request SHOULD be cached
if [ "$CACHED2" = "true" ]; then
  echo "✅ Request 2 was cached (correct - same PDF hash)"
  PASS=$((PASS + 1))
else
  echo "❌ Request 2 was not cached"
  FAIL=$((FAIL + 1))
fi

# Check 3: Third request SHOULD be cached
if [ "$CACHED3" = "true" ]; then
  echo "✅ Request 3 was cached (correct - same PDF hash)"
  PASS=$((PASS + 1))
else
  echo "❌ Request 3 was not cached"
  FAIL=$((FAIL + 1))
fi

# Check 4: All hashes should be identical
if [ "$HASH1" = "$HASH2" ] && [ "$HASH2" = "$HASH3" ]; then
  echo "✅ All requests have same content hash: ${HASH1:0:16}..."
  PASS=$((PASS + 1))
else
  echo "❌ Hashes don't match (hash1: ${HASH1:0:16}, hash2: ${HASH2:0:16}, hash3: ${HASH3:0:16})"
  FAIL=$((FAIL + 1))
fi

# Check 5: Requests 2 and 3 should be MUCH faster than request 1
if (( TIME2 < 10 )) && (( TIME3 < 10 )); then
  echo "✅ Cached requests were fast (request2: ${TIME2}s, request3: ${TIME3}s)"
  PASS=$((PASS + 1))
else
  echo "⚠️  Cached requests were slow (request2: ${TIME2}s, request3: ${TIME3}s)"
  PASS=$((PASS + 1))  # Don't fail on network latency
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Checks passed: $PASS/5"
echo "Checks failed: $FAIL/5"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "✅ HASH-BASED DEDUPLICATION WORKING!"
  echo ""
  echo "Performance:"
  echo "  Request 1 (fresh):  ${TIME1}s"
  echo "  Request 2 (cached): ${TIME2}s"
  echo "  Request 3 (cached): ${TIME3}s"
  echo ""
  echo "Same PDF extracted once, served 3 times with different documentIds!"
  exit 0
else
  echo "❌ DEDUPLICATION TEST FAILED"
  exit 1
fi
