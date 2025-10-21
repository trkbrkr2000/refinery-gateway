#!/bin/bash

# Test with real PDF file

if [ -z "$1" ]; then
  echo "Usage: ./test-real-pdf.sh <path-to-pdf>"
  echo ""
  echo "Example:"
  echo "  ./test-real-pdf.sh ~/Documents/va-decision.pdf"
  exit 1
fi

PDF_PATH="$1"

if [ ! -f "$PDF_PATH" ]; then
  echo "❌ File not found: $PDF_PATH"
  exit 1
fi

set -e

echo "🧪 Testing with real PDF"
echo "📄 File: $PDF_PATH"
echo ""

# Generate unique document ID
DOCID="real-pdf-$(date +%s)"
echo "🆔 Document ID: $DOCID"
echo ""

# Step 1: Submit extraction
echo "1️⃣ Submitting extraction request..."
RESPONSE=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"file://$PDF_PATH\"}")

if echo "$RESPONSE" | jq -e '.documentId' > /dev/null 2>&1; then
  echo "   ✅ Extraction submitted"
  METHOD=$(echo "$RESPONSE" | jq -r '.extractionMetadata.method')
  PAGES=$(echo "$RESPONSE" | jq -r '.extractionMetadata.pageCount')
  echo "   Method: $METHOD, Pages: $PAGES"
else
  echo "   ❌ Failed"
  echo "$RESPONSE" | jq
  exit 1
fi

echo ""

# Step 2: Wait for processing
echo "2️⃣ Waiting for Groq analysis (5 seconds)..."
for i in {1..5}; do
  echo -n "   ."
  sleep 1
done
echo " done"
echo ""

# Step 3: Retrieve results
echo "3️⃣ Retrieving analysis..."
RESULT=$(curl -s "http://localhost:3001/api/v1/documents/$DOCID")

if echo "$RESULT" | jq -e '.hasAnalysis' > /dev/null 2>&1; then
  echo "   ✅ Complete"
  echo ""
  echo "📊 Extraction Results:"
  echo "$RESULT" | jq -r '"   Veteran: \(.extraction.veteranInfo.firstName) \(.extraction.veteranInfo.lastName)"'
  echo "$RESULT" | jq -r '"   SSN: \(.extraction.veteranInfo.ssn)"'
  echo "$RESULT" | jq -r '"   PII Redacted: \(.extraction.piiRedacted)"'
  echo ""
  echo "📊 Analysis Results:"
  echo "$RESULT" | jq -r '"   Summary: \(.analysis.summary[:150])..."'
  echo "$RESULT" | jq -r '"   Conditions: \(.analysis.conditions | length)"'
  echo "$RESULT" | jq '.analysis.conditions[] | "     - \(.name): \(.status) \(if .rating then "(\(.rating)%)" else "" end)"'
  echo ""
  echo "✅ Test PASSED"
  echo ""
  echo "📝 View full results:"
  echo "   curl http://localhost:3001/api/v1/documents/$DOCID | jq"
else
  echo "   ❌ Failed"
  echo "$RESULT" | jq
  exit 1
fi
