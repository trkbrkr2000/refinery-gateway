#!/bin/bash
# Quick test of the current running server
curl -s -X POST http://localhost:3001/api/v1/va-knowledge/extract-decision-info \
  -F "file=@sample-data/decisions/ClaimLetter-2025-10-6.pdf" | jq '.'
