#!/bin/bash

# Show saved extraction outputs from _test-data/extraction-outputs/
# Much faster than re-extracting

OUTPUT_DIR="_test-data/extraction-outputs"

if [ ! -d "$OUTPUT_DIR" ]; then
  echo "❌ No saved extractions found"
  echo ""
  echo "Run this first to save extractions:"
  echo "  _scripts/test/show-all-extractions.sh --save"
  exit 1
fi

EXTRACTIONS=($(find "$OUTPUT_DIR" -name "*.json" -type f | sort))

if [ ${#EXTRACTIONS[@]} -eq 0 ]; then
  echo "❌ No JSON files found in $OUTPUT_DIR"
  exit 1
fi

echo "📁 SAVED EXTRACTIONS"
echo ""
echo "Found ${#EXTRACTIONS[@]} saved extractions"
echo ""

for extraction in "${EXTRACTIONS[@]}"; do
  FILENAME=$(basename "$extraction")

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📄 $FILENAME"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  echo "📋 METADATA:"
  jq '.extractionMetadata' "$extraction"
  echo ""

  echo "👤 VETERAN INFO:"
  jq '.veteranInfo' "$extraction"
  echo ""

  RATING_COUNT=$(jq -r '.ratings | length' "$extraction")
  echo "⚖️  RATINGS ($RATING_COUNT found):"
  jq '.ratings' "$extraction"
  echo ""

  DENIAL_COUNT=$(jq -r '.denialReasons | length' "$extraction")
  echo "❌ DENIAL REASONS ($DENIAL_COUNT found):"
  jq '.denialReasons' "$extraction"
  echo ""

  echo "📝 RAW TEXT (first 300 chars):"
  jq -r '.rawText' "$extraction" | head -c 300
  echo "..."
  echo ""
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To view a specific extraction:"
echo "  jq '.' $OUTPUT_DIR/<filename> | less"
echo ""
echo "To view just the ratings:"
echo "  jq '.ratings' $OUTPUT_DIR/<filename>"
echo ""
echo "To view the full raw text:"
echo "  jq -r '.rawText' $OUTPUT_DIR/<filename> | less"
