#!/bin/bash

# Show full extraction output for a single PDF
# Usage: ./show-extraction.sh <pdf-file>

if [ -z "$1" ]; then
  echo "Usage: $0 <pdf-file>"
  echo ""
  echo "Example:"
  echo "  $0 _test-data/decisions/_ptsd-denial.pdf"
  exit 1
fi

PDF_FILE="$1"

if [ ! -f "$PDF_FILE" ]; then
  echo "❌ File not found: $PDF_FILE"
  exit 1
fi

# Check if Python service is running
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
  echo "❌ Python service not running on port 8000"
  echo "   Start it with: cd refinery-python && uvicorn main:app --reload --port 8000"
  exit 1
fi

# Convert to absolute path
ABS_PATH=$(cd "$(dirname "$PDF_FILE")" && pwd)/$(basename "$PDF_FILE")
DOCID="show-$(date +%s)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 EXTRACTION OUTPUT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "File: $(basename "$PDF_FILE")"
echo "Path: $ABS_PATH"
echo ""

# Extract
RESPONSE=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"file://$ABS_PATH\"}")

# Display formatted output
echo "$RESPONSE" | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "To see raw text:"
echo "  echo '$RESPONSE' | jq -r '.rawText' | less"
echo ""
echo "To save to file:"
echo "  echo '$RESPONSE' | jq '.' > extraction-output.json"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
