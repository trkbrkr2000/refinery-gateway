#!/bin/bash
# Test rating extraction with approval PDFs

echo "Testing combined rating extraction..."
echo "======================================"
echo ""

# Test sleep apnea approval (force re-extraction with random doc ID)
TEST_ID="test-sleep-apnea-$RANDOM"
curl -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$TEST_ID\",\"storageUrl\":\"_sleep-apnea-hypertension-approval.pdf\",\"skipCache\":true}" \
  --silent > /tmp/sleep-apnea-result.json

echo "Ratings extracted:"
cat /tmp/sleep-apnea-result.json | jq '.ratings'

echo ""
echo "Combined Rating:"
cat /tmp/sleep-apnea-result.json | jq '.combinedRating'

echo ""
echo "Monthly Payment:"
cat /tmp/sleep-apnea-result.json | jq '.monthlyPayment'

echo ""
echo "Raw text sample (first 2000 chars):"
cat /tmp/sleep-apnea-result.json | jq -r '.rawText' | head -c 2000
echo ""
echo "..."
