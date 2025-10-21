#!/bin/bash

# Test basic flow with stub data

set -e

echo "🧪 Testing basic flow with stub data"
echo ""

# Generate unique document ID
DOCID="test-$(date +%s)"
echo "📄 Document ID: $DOCID"
echo ""

# Step 1: Submit extraction
echo "1️⃣ Submitting extraction request..."
RESPONSE=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"s3://test-bucket/decision.pdf\"}")

if echo "$RESPONSE" | jq -e '.documentId' > /dev/null 2>&1; then
  echo "   ✅ Extraction submitted"
  echo "$RESPONSE" | jq -r '"   Ratings: \(.ratings | length), PII Redacted: \(.piiRedacted)"'
else
  echo "   ❌ Failed"
  echo "$RESPONSE" | jq
  exit 1
fi

echo ""

# Step 2: Wait for processing
echo "2️⃣ Waiting for Groq analysis (3 seconds)..."
for i in {1..3}; do
  echo -n "   ."
  sleep 1
done
echo " done"
echo ""

# Step 3: Retrieve complete document
echo "3️⃣ Retrieving complete document..."
RESULT=$(curl -s "http://localhost:3001/api/v1/documents/$DOCID")

if echo "$RESULT" | jq -e '.hasAnalysis' > /dev/null 2>&1; then
  HAS_ANALYSIS=$(echo "$RESULT" | jq -r '.hasAnalysis')

  if [ "$HAS_ANALYSIS" = "true" ]; then
    echo "   ✅ Analysis complete"
    echo ""
    echo "📊 Results:"
    echo "$RESULT" | jq -r '"   Summary: \(.analysis.summary[:100])..."'
    echo "$RESULT" | jq -r '"   Conditions: \(.analysis.conditions | length)"'
    echo "$RESULT" | jq -r '"   Missing Evidence: \(.analysis.missingEvidence | length)"'
    echo "$RESULT" | jq -r '"   Next Steps: \(.analysis.nextSteps | length)"'
    echo "$RESULT" | jq -r '"   LLM Response Time: \(.analysis.llmMetadata.responseTimeMs)ms"'
    echo ""
    echo "✅ Test PASSED"
    echo ""
    echo "📝 View full results:"
    echo "   curl http://localhost:3001/api/v1/documents/$DOCID | jq"
  else
    echo "   ❌ Analysis not complete"
    exit 1
  fi
else
  echo "   ❌ Failed to retrieve document"
  echo "$RESULT" | jq
  exit 1
fi
