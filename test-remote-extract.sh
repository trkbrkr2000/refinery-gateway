#!/bin/bash

DOC_ID="demo-doc-$(date +%s)"

echo "Testing extraction on deployed service..."
echo "Document ID: $DOC_ID"
echo

curl -s -X POST \
  https://refinery-python-production.up.railway.app/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{
    \"documentId\": \"$DOC_ID\",
    \"storageUrl\": \"s3://demo-bucket/sample-va-decision.pdf\"
  }" | jq .

echo
echo "Checking if event was sent to API..."
sleep 2
curl -s "https://api.monkeybarrels.com/api/v1/documents/$DOC_ID" | jq .
