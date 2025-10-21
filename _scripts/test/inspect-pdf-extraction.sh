#!/bin/bash

# Inspect what Docling extracts from a PDF
# Shows the raw text and parsed data for debugging

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

# Get absolute path
ABS_PATH=$(cd "$(dirname "$PDF_FILE")" && pwd)/$(basename "$PDF_FILE")

echo "🔍 Inspecting PDF Extraction"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "File: $(basename "$PDF_FILE")"
echo "Path: $ABS_PATH"
echo ""

# Check if Python service is running
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
  echo "❌ Python service not running on port 8000"
  exit 1
fi

DOCID="inspect-$(date +%s)"

echo "Extracting with Docling..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:8000/extraction/extract \
  -H "Content-Type: application/json" \
  -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"file://$ABS_PATH\"}")

# Check if extraction succeeded
if ! echo "$RESPONSE" | jq -e '.documentId' > /dev/null 2>&1; then
  echo "❌ Extraction failed"
  echo "$RESPONSE" | jq
  exit 1
fi

# Extraction metadata
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "EXTRACTION METADATA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$RESPONSE" | jq '.extractionMetadata'
echo ""

# Veteran info
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "VETERAN INFO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$RESPONSE" | jq '.veteranInfo'
echo ""

# Ratings
RATING_COUNT=$(echo "$RESPONSE" | jq -r '.ratings | length')
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RATINGS ($RATING_COUNT found)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$RATING_COUNT" -gt 0 ]; then
  echo "$RESPONSE" | jq '.ratings'
else
  echo "(none found - regex may need adjustment)"
fi
echo ""

# Denial reasons
DENIAL_COUNT=$(echo "$RESPONSE" | jq -r '.denialReasons | length')
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DENIAL REASONS ($DENIAL_COUNT found)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$DENIAL_COUNT" -gt 0 ]; then
  echo "$RESPONSE" | jq '.denialReasons'
else
  echo "(none found)"
fi
echo ""

# Raw text (first 1000 chars)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RAW TEXT SAMPLE (first 1000 characters)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$RESPONSE" | jq -r '.rawText' | head -c 1000
echo ""
echo "..."
echo ""

# Save full extraction to file
OUTPUT_FILE="/tmp/pdf-extraction-$(date +%s).json"
echo "$RESPONSE" | jq '.' > "$OUTPUT_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Full extraction saved to: $OUTPUT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To view full raw text:"
echo "  jq -r '.rawText' $OUTPUT_FILE | less"
echo ""
echo "To search for specific text:"
echo "  jq -r '.rawText' $OUTPUT_FILE | grep -i 'rating'"
