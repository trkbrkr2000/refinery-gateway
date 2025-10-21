#!/bin/bash

echo "Testing /extraction/extract with JSON payload..."
echo

# Test with a non-file URL (will trigger stub data)
echo "1. Testing with stub data (no local file)..."
RESPONSE=$(curl -s -X POST \
  https://refinery-python-production.up.railway.app/extraction/extract \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "test-doc-'$(date +%s)'",
    "storageUrl": "s3://test-bucket/test.pdf"
  }')

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo

echo "✅ Test complete!"
