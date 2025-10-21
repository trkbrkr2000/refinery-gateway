#!/bin/bash

# Performance test - measure processing times

echo "🧪 Performance Test (10 iterations)"
echo ""

TIMES=()

for i in {1..10}; do
  DOCID="perf-test-$i-$(date +%s)"

  # Start timer
  START=$(date +%s%N)

  # Submit extraction
  curl -s -X POST http://localhost:8000/extraction/extract \
    -H "Content-Type: application/json" \
    -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"s3://test/doc.pdf\"}" \
    > /dev/null 2>&1

  # Wait for completion
  sleep 3

  # Check if complete
  RESULT=$(curl -s "http://localhost:3001/api/v1/documents/$DOCID" 2>/dev/null)

  # End timer
  END=$(date +%s%N)

  # Calculate duration in ms
  DURATION=$(( (END - START) / 1000000 ))
  TIMES+=($DURATION)

  if echo "$RESULT" | jq -e '.hasAnalysis' > /dev/null 2>&1; then
    HAS_ANALYSIS=$(echo "$RESULT" | jq -r '.hasAnalysis')
    if [ "$HAS_ANALYSIS" = "true" ]; then
      LLM_TIME=$(echo "$RESULT" | jq -r '.analysis.llmMetadata.responseTimeMs')
      echo "   Test $i: ${DURATION}ms (LLM: ${LLM_TIME}ms) ✅"
    else
      echo "   Test $i: ${DURATION}ms ⏳"
    fi
  else
    echo "   Test $i: ${DURATION}ms ❌"
  fi
done

echo ""
echo "📊 Performance Summary:"

# Calculate average
SUM=0
for time in "${TIMES[@]}"; do
  SUM=$((SUM + time))
done
AVG=$((SUM / ${#TIMES[@]}))

# Find min/max
MIN=${TIMES[0]}
MAX=${TIMES[0]}
for time in "${TIMES[@]}"; do
  [ $time -lt $MIN ] && MIN=$time
  [ $time -gt $MAX ] && MAX=$time
done

echo "   Average: ${AVG}ms"
echo "   Min: ${MIN}ms"
echo "   Max: ${MAX}ms"
echo ""

if [ $AVG -lt 3500 ]; then
  echo "✅ Performance GOOD (< 3.5s average)"
else
  echo "⚠️  Performance SLOW (> 3.5s average)"
fi
