#!/bin/bash

# Test Groq LLM service in isolation
# Requires GROQ_API_KEY to be set

echo "🧪 Testing Groq LLM Service (Isolated)"
echo ""

# Check if NestJS API is running
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
  echo "❌ NestJS API not running on port 3001"
  echo "   Start it with: cd refinery-api && npm run start:dev"
  exit 1
fi

echo "✅ NestJS API is running"
echo ""

# Check if GROQ_API_KEY is configured
if ! grep -q "GROQ_API_KEY" refinery-api/.env 2>/dev/null; then
  echo "⚠️  WARNING: GROQ_API_KEY may not be configured"
  echo "   Check refinery-api/.env file"
fi

echo ""

# Test: Submit a job and check if Groq analysis completes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST: Groq LLM Analysis via Queue"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DOCID="groq-test-$(date +%s)"
echo "Document ID: $DOCID"
echo ""

# Create test extraction data
EXTRACTION_DATA=$(cat <<EOF
{
  "documentId": "$DOCID",
  "extractedAt": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")",
  "veteranInfo": {
    "firstName": "John",
    "lastName": "Smith",
    "ssn": "XXX-XX-XXXX"
  },
  "ratings": [
    {
      "condition": "Tinnitus",
      "decision": "denied",
      "ratingPercentage": 0
    },
    {
      "condition": "PTSD",
      "decision": "granted",
      "ratingPercentage": 70,
      "effectiveDate": "2024-01-01"
    }
  ],
  "denialReasons": [
    {
      "condition": "Tinnitus",
      "reason": "Insufficient evidence of in-service event"
    }
  ],
  "rawText": "DEPARTMENT OF VETERANS AFFAIRS\\nRATING DECISION\\n\\nThe veteran's claim for PTSD has been granted at 70%. The claim for Tinnitus was denied due to insufficient evidence.",
  "piiRedacted": true,
  "extractionMetadata": {
    "method": "test",
    "confidence": 0.95,
    "pageCount": 8,
    "processingTimeMs": 0
  }
}
EOF
)

echo "Submitting job to queue..."
RESPONSE=$(curl -s -X POST http://localhost:3001/internal/queue/document-extracted \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOCID\",\"extractionData\":$EXTRACTION_DATA}")

if echo "$RESPONSE" | jq -e '.jobId' > /dev/null 2>&1; then
  echo "✅ Job submitted"
  echo ""
  echo "Waiting for Groq analysis (3 seconds)..."

  for i in {1..3}; do
    echo -n "  ."
    sleep 1
  done
  echo " done"
  echo ""

  # Check if analysis was completed
  RESULT=$(curl -s "http://localhost:3001/api/v1/documents/$DOCID/analysis" 2>/dev/null)

  if echo "$RESULT" | jq -e '.summary' > /dev/null 2>&1; then
    echo "✅ PASS: Groq analysis completed successfully"
    echo ""
    echo "Analysis Results:"
    echo "$RESULT" | jq -r '"  Summary: \(.summary[:100])..."'
    echo "$RESULT" | jq -r '"  Conditions: \(.conditions | length)"'
    echo "$RESULT" | jq -r '"  Missing Evidence: \(.missingEvidence | length)"'
    echo "$RESULT" | jq -r '"  Next Steps: \(.nextSteps | length)"'
    echo "$RESULT" | jq -r '"  Response Time: \(.llmMetadata.responseTimeMs)ms"'
    echo "$RESULT" | jq -r '"  Model: \(.llmMetadata.model)"'
    echo ""

    # Verify analysis quality
    CONDITIONS=$(echo "$RESULT" | jq -r '.conditions | length')
    SUMMARY=$(echo "$RESULT" | jq -r '.summary')

    if [ "$CONDITIONS" -ge 2 ] && [ -n "$SUMMARY" ]; then
      echo "✅ PASS: Analysis quality looks good"
      echo "   - Found $CONDITIONS conditions"
      echo "   - Summary generated"
    else
      echo "⚠️  WARNING: Analysis may be incomplete"
      echo "   - Conditions: $CONDITIONS (expected >= 2)"
      echo "   - Summary: ${#SUMMARY} chars"
    fi

  else
    echo "❌ FAIL: No analysis found (Groq may have failed)"
    echo "   Response: $RESULT"
    exit 1
  fi
else
  echo "❌ FAIL: Job submission failed"
  echo "$RESPONSE" | jq
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Groq LLM Service Tests Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Note: This test validates Groq via the full pipeline."
echo "For true isolation, create a unit test that calls GroqService directly."
