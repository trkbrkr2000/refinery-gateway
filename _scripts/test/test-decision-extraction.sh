#!/bin/bash

# VA Decision Letter Extraction Test Script
# Usage: ./test-decision-extraction.sh path/to/decision-letter.pdf

if [ -z "$1" ]; then
  echo "Usage: $0 <path-to-pdf>"
  echo "Example: $0 sample-data/decisions/ClaimLetter-2025-4-11.pdf"
  exit 1
fi

PDF_PATH="$1"

if [ ! -f "$PDF_PATH" ]; then
  echo "Error: File not found: $PDF_PATH"
  exit 1
fi

echo "=========================================="
echo "Testing VA Decision Letter Extraction"
echo "=========================================="
echo "PDF: $PDF_PATH"
echo ""
echo "Sending request to API..."

curl -s -X POST http://localhost:3001/api/v1/va-knowledge/extract-decision-info \
  -F "file=@${PDF_PATH}" | jq '.'

echo ""
echo "=========================================="
echo "Test Complete"
echo "=========================================="
