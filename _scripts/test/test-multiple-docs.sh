#!/bin/bash

# Test multiple documents concurrently

set -e

echo "🧪 Testing multiple documents (5 concurrent)"
echo ""

TIMESTAMP=$(date +%s)
DOCIDS=()

# Submit 5 documents in parallel
echo "1️⃣ Submitting 5 documents..."
for i in {1..5}; do
  DOCID="batch-test-$i-$TIMESTAMP"
  DOCIDS+=("$DOCID")

  (
    curl -s -X POST http://localhost:8000/extraction/extract \
      -H "Content-Type: application/json" \
      -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"s3://test-bucket/doc-$i.pdf\"}" \
      > /dev/null 2>&1
    echo "   ✅ Document $i submitted: $DOCID"
  ) &
done

# Wait for all submissions
wait
echo ""

# Wait for processing
echo "2️⃣ Waiting for processing (6 seconds)..."
for i in {1..6}; do
  echo -n "   ."
  sleep 1
done
echo " done"
echo ""

# Check each document
echo "3️⃣ Checking results..."
SUCCESS=0
FAILED=0

for DOCID in "${DOCIDS[@]}"; do
  RESULT=$(curl -s "http://localhost:3001/api/v1/documents/$DOCID" 2>/dev/null)

  if echo "$RESULT" | jq -e '.hasAnalysis' > /dev/null 2>&1; then
    HAS_ANALYSIS=$(echo "$RESULT" | jq -r '.hasAnalysis')
    if [ "$HAS_ANALYSIS" = "true" ]; then
      echo "   ✅ $DOCID: Complete"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "   ⏳ $DOCID: Processing..."
      FAILED=$((FAILED + 1))
    fi
  else
    echo "   ❌ $DOCID: Failed"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "📊 Results:"
echo "   Success: $SUCCESS/5"
echo "   Failed: $FAILED/5"
echo ""

if [ $SUCCESS -eq 5 ]; then
  echo "✅ Test PASSED - All documents processed"
  echo ""
  echo "📝 View recent analyses:"
  echo "   curl 'http://localhost:3001/api/v1/documents?limit=5' | jq"
else
  echo "⚠️  Test PARTIAL - Some documents failed or still processing"
  exit 1
fi
