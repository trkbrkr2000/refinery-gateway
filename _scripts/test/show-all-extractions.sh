#!/bin/bash

# Show extraction output for all PDFs side-by-side
# Usage: ./show-all-extractions.sh [--save]

SAVE_MODE=false
if [ "$1" = "--save" ]; then
  SAVE_MODE=true
  OUTPUT_DIR="_test-data/extraction-outputs"
  mkdir -p "$OUTPUT_DIR"
fi

# Check if Python service is running
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
  echo "❌ Python service not running on port 8000"
  echo "   Start it with: cd refinery-python && uvicorn main:app --reload --port 8000"
  exit 1
fi

DECISION_DIR="_test-data/decisions"

if [ ! -d "$DECISION_DIR" ]; then
  echo "❌ Decision letters directory not found: $DECISION_DIR"
  exit 1
fi

# Find all PDFs
PDFS=($(find "$DECISION_DIR" -name "*.pdf" -type f | sort))

if [ ${#PDFS[@]} -eq 0 ]; then
  echo "❌ No PDF files found in $DECISION_DIR"
  exit 1
fi

echo "🔍 EXTRACTION OUTPUTS FOR ALL DECISION LETTERS"
echo ""
echo "Found ${#PDFS[@]} PDFs"
echo ""

# Process each PDF
for pdf in "${PDFS[@]}"; do
  FILENAME=$(basename "$pdf")
  DOCID="show-$(echo "$FILENAME" | sed 's/\.pdf$//' | tr -d '_')-$(date +%s)"

  # Convert to absolute path
  ABS_PATH=$(cd "$(dirname "$pdf")" && pwd)/$(basename "$pdf")

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📄 $(basename "$pdf")"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Extract
  echo "Extracting..."
  RESPONSE=$(curl -s -X POST http://localhost:8000/extraction/extract \
    -H "Content-Type: application/json" \
    -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"file://$ABS_PATH\"}")

  if ! echo "$RESPONSE" | jq -e '.documentId' > /dev/null 2>&1; then
    echo "❌ Extraction failed"
    echo "$RESPONSE"
    echo ""
    continue
  fi

  # Display key sections
  echo "📋 METADATA:"
  echo "$RESPONSE" | jq '.extractionMetadata'
  echo ""

  echo "👤 VETERAN INFO:"
  echo "$RESPONSE" | jq '.veteranInfo'
  echo ""

  echo "⚖️  RATINGS ($(echo "$RESPONSE" | jq -r '.ratings | length') found):"
  echo "$RESPONSE" | jq '.ratings'
  echo ""

  echo "❌ DENIAL REASONS ($(echo "$RESPONSE" | jq -r '.denialReasons | length') found):"
  echo "$RESPONSE" | jq '.denialReasons'
  echo ""

  echo "📝 RAW TEXT (first 500 chars):"
  echo "$RESPONSE" | jq -r '.rawText' | head -c 500
  echo "..."
  echo ""
  echo ""

  # Save if requested
  if [ "$SAVE_MODE" = true ]; then
    OUTPUT_FILE="$OUTPUT_DIR/$(echo "$FILENAME" | sed 's/\.pdf$/.json/')"
    echo "$RESPONSE" | jq '.' > "$OUTPUT_FILE"
    echo "💾 Saved to: $OUTPUT_FILE"
    echo ""
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$SAVE_MODE" = true ]; then
  echo "📁 All extractions saved to: $OUTPUT_DIR/"
  echo ""
  echo "To view a specific extraction:"
  echo "  jq '.' $OUTPUT_DIR/<filename>.json | less"
  echo ""
  echo "To see just the ratings:"
  echo "  jq '.ratings' $OUTPUT_DIR/<filename>.json"
  echo ""
  echo "To see just the raw text:"
  echo "  jq -r '.rawText' $OUTPUT_DIR/<filename>.json | less"
else
  echo "To save all extractions to files, run:"
  echo "  $0 --save"
fi
echo ""
