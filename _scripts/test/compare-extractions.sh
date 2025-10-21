#!/bin/bash

# Compare extraction outputs side-by-side for multiple PDFs
# Shows only key fields for easy comparison

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

echo "📊 EXTRACTION COMPARISON"
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════════════╗"
printf "║ %-30s │ %-8s │ %-8s │ %-8s │ %-8s ║\n" "FILE" "METHOD" "PAGES" "RATINGS" "DENIALS"
echo "╠════════════════════════════════════════════════════════════════════════════════════╣"

# Process each PDF
for pdf in "${PDFS[@]}"; do
  FILENAME=$(basename "$pdf")
  DOCID="compare-$(echo "$FILENAME" | sed 's/\.pdf$//' | tr -d '_')-$(date +%s)"

  # Convert to absolute path
  ABS_PATH=$(cd "$(dirname "$pdf")" && pwd)/$(basename "$pdf")

  # Extract
  RESPONSE=$(curl -s -X POST http://localhost:8000/extraction/extract \
    -H "Content-Type: application/json" \
    -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"file://$ABS_PATH\"}")

  if ! echo "$RESPONSE" | jq -e '.documentId' > /dev/null 2>&1; then
    printf "║ %-30s │ %-8s │ %-8s │ %-8s │ %-8s ║\n" "${FILENAME:0:30}" "ERROR" "-" "-" "-"
    continue
  fi

  METHOD=$(echo "$RESPONSE" | jq -r '.extractionMetadata.method')
  PAGES=$(echo "$RESPONSE" | jq -r '.extractionMetadata.pageCount')
  RATINGS=$(echo "$RESPONSE" | jq -r '.ratings | length')
  DENIALS=$(echo "$RESPONSE" | jq -r '.denialReasons | length')

  # Truncate filename if too long
  DISPLAY_NAME="${FILENAME:0:30}"

  printf "║ %-30s │ %-8s │ %-8s │ %-8s │ %-8s ║\n" "$DISPLAY_NAME" "$METHOD" "$PAGES" "$RATINGS" "$DENIALS"
done

echo "╚════════════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Legend:"
echo "  METHOD   - Extraction method (docling or stub)"
echo "  PAGES    - Number of pages in PDF"
echo "  RATINGS  - Number of conditions/ratings found"
echo "  DENIALS  - Number of denial reasons extracted"
echo ""
echo "To see detailed output for a specific PDF:"
echo "  _scripts/test/show-extraction.sh <pdf-file>"
echo ""
echo "To see all extractions with full details:"
echo "  _scripts/test/show-all-extractions.sh"
