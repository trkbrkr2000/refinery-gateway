#!/bin/bash

# Test all decision letters in _test-data/decisions/
# Shows extraction results for each PDF

echo "🧪 Testing All VA Decision Letters"
echo ""

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

echo "Found ${#PDFS[@]} decision letters"
echo ""

# Process each PDF
for pdf in "${PDFS[@]}"; do
  FILENAME=$(basename "$pdf")
  DOCID="test-$(echo "$FILENAME" | sed 's/\.pdf$//' | tr -d '_')-$(date +%s)"

  # Convert to absolute path
  ABS_PATH=$(cd "$(dirname "$pdf")" && pwd)/$(basename "$pdf")

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📄 $FILENAME"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Document ID: $DOCID"
  echo "Path: $ABS_PATH"
  echo ""

  # Extract with Docling (use absolute path)
  echo "Extracting..."
  RESPONSE=$(curl -s -X POST http://localhost:8000/extraction/extract \
    -H "Content-Type: application/json" \
    -d "{\"documentId\":\"$DOCID\",\"storageUrl\":\"file://$ABS_PATH\"}")

  if ! echo "$RESPONSE" | jq -e '.documentId' > /dev/null 2>&1; then
    echo "❌ Extraction failed"
    echo "$RESPONSE" | jq
    echo ""
    continue
  fi

  # Parse results
  METHOD=$(echo "$RESPONSE" | jq -r '.extractionMetadata.method')
  PAGES=$(echo "$RESPONSE" | jq -r '.extractionMetadata.pageCount')
  CONFIDENCE=$(echo "$RESPONSE" | jq -r '.extractionMetadata.confidence')
  RATING_COUNT=$(echo "$RESPONSE" | jq -r '.ratings | length')
  DENIAL_COUNT=$(echo "$RESPONSE" | jq -r '.denialReasons | length')

  echo "Results:"
  echo "  Method: $METHOD"
  echo "  Pages: $PAGES"
  echo "  Confidence: $CONFIDENCE"
  echo ""

  # Show veteran info
  echo "  Veteran Info:"
  echo "$RESPONSE" | jq -r '  "    First Name: \(.veteranInfo.firstName)"'
  echo "$RESPONSE" | jq -r '  "    Last Name: \(.veteranInfo.lastName)"'
  echo "$RESPONSE" | jq -r '  "    SSN: \(.veteranInfo.ssn)"'
  echo ""

  # Show ratings
  echo "  Ratings Found: $RATING_COUNT"
  if [ "$RATING_COUNT" -gt 0 ]; then
    echo "$RESPONSE" | jq -r '.ratings[] | "    - \(.condition): \(.decision) \(if .ratingPercentage then "(\(.ratingPercentage)%)" else "" end)"'
  else
    echo "    (none - may need to improve parsing)"
  fi
  echo ""

  # Show denials
  echo "  Denial Reasons: $DENIAL_COUNT"
  if [ "$DENIAL_COUNT" -gt 0 ]; then
    echo "$RESPONSE" | jq -r '.denialReasons[] | "    - \(.condition): \(.reason)"'
  fi
  echo ""

  # Show raw text snippet
  echo "  Raw Text Sample (first 200 chars):"
  echo "$RESPONSE" | jq -r '.rawText' | head -c 200
  echo "..."
  echo ""

  # Wait for Groq analysis (optional)
  if [ "$1" = "--analyze" ]; then
    echo "  Waiting for Groq analysis (3 seconds)..."
    sleep 3

    ANALYSIS=$(curl -s "http://localhost:3001/api/v1/documents/$DOCID/analysis" 2>/dev/null)

    if echo "$ANALYSIS" | jq -e '.summary' > /dev/null 2>&1; then
      echo ""
      echo "  AI Analysis:"
      echo "$ANALYSIS" | jq -r '  "    Summary: \(.summary[:150])..."'
      echo "$ANALYSIS" | jq -r '  "    Conditions: \(.conditions | length)"'
      echo "$ANALYSIS" | jq -r '  "    Missing Evidence: \(.missingEvidence | length)"'
    fi
  fi

  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All Decision Letters Tested"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  Total PDFs: ${#PDFS[@]}"
echo ""
echo "To see AI analysis for each, run:"
echo "  $0 --analyze"
