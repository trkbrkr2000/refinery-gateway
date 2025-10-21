#!/bin/bash

# Test MongoDB operations in isolation
# Tests collections, indexes, and data integrity

echo "🧪 Testing MongoDB Operations (Isolated)"
echo ""

# Check if MongoDB is running
if ! mongosh --quiet --eval "db.adminCommand('ping')" refinery > /dev/null 2>&1; then
  echo "❌ MongoDB not running or 'refinery' database not accessible"
  echo "   Start it with: mongod --dbpath ~/data/db"
  exit 1
fi

echo "✅ MongoDB is running"
echo ""

# Test 1: Database connection
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Database Connection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DB_NAME=$(mongosh --quiet --eval "db.getName()" refinery 2>/dev/null)
if [ "$DB_NAME" = "refinery" ]; then
  echo "✅ PASS: Connected to database '$DB_NAME'"
else
  echo "❌ FAIL: Could not connect to 'refinery' database"
  exit 1
fi

echo ""

# Test 2: Check collections exist
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Check Required Collections"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

COLLECTIONS=$(mongosh --quiet --eval "db.getCollectionNames()" refinery 2>/dev/null)

echo "Collections found:"
echo "$COLLECTIONS" | jq -r '.[]' | while read col; do
  echo "  - $col"
done
echo ""

# Check for our specific collections
if echo "$COLLECTIONS" | jq -e 'index("document_extractions")' > /dev/null 2>&1; then
  echo "✅ PASS: 'document_extractions' collection exists"
else
  echo "⚠️  WARNING: 'document_extractions' collection not found (may not be created yet)"
fi

if echo "$COLLECTIONS" | jq -e 'index("analysis_results")' > /dev/null 2>&1; then
  echo "✅ PASS: 'analysis_results' collection exists"
else
  echo "⚠️  WARNING: 'analysis_results' collection not found (may not be created yet)"
fi

echo ""

# Test 3: Check indexes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Check Indexes on Collections"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Indexes on document_extractions:"
INDEXES=$(mongosh --quiet --eval "db.document_extractions.getIndexes()" refinery 2>/dev/null)
if [ -n "$INDEXES" ]; then
  echo "$INDEXES" | jq -r '.[] | "  - \(.name): \(.key | keys | join(", "))"'
else
  echo "  (none or collection doesn't exist yet)"
fi
echo ""

echo "Indexes on analysis_results:"
INDEXES=$(mongosh --quiet --eval "db.analysis_results.getIndexes()" refinery 2>/dev/null)
if [ -n "$INDEXES" ]; then
  echo "$INDEXES" | jq -r '.[] | "  - \(.name): \(.key | keys | join(", "))"'
else
  echo "  (none or collection doesn't exist yet)"
fi

echo ""

# Test 4: Count documents
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Document Counts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

EXTRACTION_COUNT=$(mongosh --quiet --eval "db.document_extractions.countDocuments()" refinery 2>/dev/null || echo "0")
ANALYSIS_COUNT=$(mongosh --quiet --eval "db.analysis_results.countDocuments()" refinery 2>/dev/null || echo "0")

echo "Documents in database:"
echo "  Extractions: $EXTRACTION_COUNT"
echo "  Analyses: $ANALYSIS_COUNT"
echo ""

if [ "$EXTRACTION_COUNT" -gt 0 ] && [ "$ANALYSIS_COUNT" -gt 0 ]; then
  echo "✅ PASS: Documents exist in both collections"
elif [ "$EXTRACTION_COUNT" -eq 0 ] && [ "$ANALYSIS_COUNT" -eq 0 ]; then
  echo "⚠️  INFO: No documents yet (database is empty)"
else
  echo "⚠️  WARNING: Mismatch between extraction and analysis counts"
fi

echo ""

# Test 5: Sample a recent document
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Data Integrity Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$EXTRACTION_COUNT" -gt 0 ]; then
  echo "Checking recent extraction..."
  SAMPLE=$(mongosh --quiet --eval "db.document_extractions.findOne({}, {documentId: 1, veteranInfo: 1, ratings: 1, extractionMetadata: 1})" refinery 2>/dev/null)

  if [ -n "$SAMPLE" ]; then
    DOCID=$(echo "$SAMPLE" | jq -r '.documentId')
    METHOD=$(echo "$SAMPLE" | jq -r '.extractionMetadata.method')
    RATINGS_COUNT=$(echo "$SAMPLE" | jq -r '.ratings | length')

    echo "  Document ID: $DOCID"
    echo "  Method: $METHOD"
    echo "  Ratings: $RATINGS_COUNT"

    # Check if corresponding analysis exists
    ANALYSIS=$(mongosh --quiet --eval "db.analysis_results.findOne({documentId: '$DOCID'}, {summary: 1, conditions: 1})" refinery 2>/dev/null)

    if [ -n "$ANALYSIS" ] && echo "$ANALYSIS" | jq -e '.summary' > /dev/null 2>&1; then
      CONDITIONS=$(echo "$ANALYSIS" | jq -r '.conditions | length')
      echo "  Analysis: Found ($CONDITIONS conditions)"
      echo ""
      echo "✅ PASS: Extraction and analysis are properly linked"
    else
      echo "  Analysis: Not found"
      echo ""
      echo "⚠️  WARNING: Extraction exists but no analysis found"
    fi
  fi
else
  echo "⚠️  SKIP: No documents to check"
fi

echo ""

# Test 6: Query performance test
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 6: Query Performance"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$ANALYSIS_COUNT" -gt 0 ]; then
  echo "Running query: Find recent analyses..."

  START=$(date +%s%N)
  RESULT=$(mongosh --quiet --eval "db.analysis_results.find({status: 'completed'}).sort({analyzedAt: -1}).limit(5).toArray()" refinery 2>/dev/null)
  END=$(date +%s%N)

  DURATION=$(( (END - START) / 1000000 ))
  COUNT=$(echo "$RESULT" | jq '. | length')

  echo "  Query time: ${DURATION}ms"
  echo "  Documents returned: $COUNT"

  if [ "$DURATION" -lt 100 ]; then
    echo "✅ PASS: Query performance good (< 100ms)"
  else
    echo "⚠️  WARNING: Query took longer than expected"
  fi
else
  echo "⚠️  SKIP: No documents to query"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MongoDB Operations Tests Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
