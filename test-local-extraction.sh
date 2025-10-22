#!/bin/bash
# Test local file extraction with denial reason parsing

echo "🧪 Testing Local File Extraction"
echo "================================="
echo ""

# Test PTSD denial letter
echo "📄 Testing: _ptsd-denial.pdf"
echo "----------------------------"

curl -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d '{"documentId":"ptsd-test-local","storageUrl":"_10-conditions-with-denial-and-deferral.pdf","skipCache":true}' \
  --silent | jq '{
    documentId,
    cached: .extractionMetadata.cached,
    denialReasons: .denialReasons,
    ratings: .ratings
  }'

echo ""
echo "✅ Test complete!"
