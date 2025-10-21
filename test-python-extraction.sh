#!/bin/bash

echo "Testing refinery-python extraction service..."
echo

# 1. Health check
echo "1. Checking health endpoint..."
HEALTH=$(curl -s --max-time 10 https://refinery-python-production.up.railway.app/health)
echo "$HEALTH" | jq . 2>/dev/null || echo "Service not ready yet: $HEALTH"
echo

# 2. Test extraction
DOC_ID="demo-$(date +%s)"
echo "2. Testing extraction with document ID: $DOC_ID"

EXTRACT=$(curl -s --max-time 30 -X POST \
  https://refinery-python-production.up.railway.app/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{
    \"documentId\": \"$DOC_ID\",
    \"storageUrl\": \"s3://demo-bucket/sample.pdf\"
  }")

echo "$EXTRACT" | jq . 2>/dev/null || echo "Extraction failed: $EXTRACT"
echo

echo "3. Checking if event was sent to API (wait 2 seconds)..."
sleep 2
curl -s "https://api.monkeybarrels.com/api/v1/documents/$DOC_ID" | jq . 2>/dev/null || echo "Document not found in API yet"

echo
echo "✅ Test complete!"
echo
echo "If service is not ready, wait 5-10 minutes and run this script again:"
echo "./test-python-extraction.sh"
