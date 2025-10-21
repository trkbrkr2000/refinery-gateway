#!/bin/bash

echo "🧪 Testing Railway S3 Connection"
echo "================================"

# Simple test to write JSON data to S3
curl -X POST http://localhost:3003/json-writer/execute \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "data": [
        {"id": 1, "name": "Test Item 1", "value": 100},
        {"id": 2, "name": "Test Item 2", "value": 200}
      ],
      "destination": {
        "bucket": "stackable-foodbox-kqa9-zq",
        "prefix": "test/",
        "filename": "test-data.json"
      },
      "format": "json"
    },
    "context": {
      "executionId": "test-'$(date +%s)'",
      "componentId": "json-writer-test"
    }
  }' | jq .

echo ""
echo "✅ Test complete!"