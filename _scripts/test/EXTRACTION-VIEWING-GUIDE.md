# Extraction Viewing Scripts

Scripts to view and inspect PDF extraction outputs.

## Quick Reference

```bash
# Compare all PDFs in a table
_scripts/test/compare-extractions.sh

# Show full extraction for one PDF
_scripts/test/show-extraction.sh _test-data/decisions/_ptsd-denial.pdf

# Show all extractions with detailed output
_scripts/test/show-all-extractions.sh

# Save all extractions to JSON files
_scripts/test/show-all-extractions.sh --save
```

---

## Scripts

### 1. `compare-extractions.sh` - Quick Comparison Table

Shows high-level stats for all PDFs in a table format.

**Usage:**
```bash
_scripts/test/compare-extractions.sh
```

**Output:**
```
╔═══════════════════════════════════════════════════════════╗
║ FILE                     │ METHOD  │ PAGES │ RATINGS │ DENIALS ║
╠═══════════════════════════════════════════════════════════╣
║ _ptsd-denial.pdf         │ docling │ 13    │ 1       │ 1       ║
║ _sleep-apnea.pdf         │ docling │ 17    │ 2       │ 0       ║
╚═══════════════════════════════════════════════════════════╝
```

**Best for:**
- Quick overview of all PDFs
- Spotting which PDFs need better extraction
- Performance comparison

---

### 2. `show-extraction.sh` - Single PDF Details

Shows complete extraction output for one PDF.

**Usage:**
```bash
_scripts/test/show-extraction.sh <pdf-file>

# Example
_scripts/test/show-extraction.sh _test-data/decisions/_ptsd-denial.pdf
```

**Output:**
Shows full JSON with all fields:
- `documentId`
- `extractedAt`
- `veteranInfo` (firstName, lastName, ssn)
- `ratings[]` (condition, decision, ratingPercentage)
- `denialReasons[]` (condition, reason, category)
- `rawText` (full extracted text)
- `piiRedacted` (boolean)
- `extractionMetadata` (method, confidence, pageCount, processingTimeMs)

**Best for:**
- Debugging extraction for specific PDFs
- Inspecting raw text output
- Copying JSON for testing

**Tips:**
```bash
# Save to file
_scripts/test/show-extraction.sh file.pdf > output.json

# View just ratings
_scripts/test/show-extraction.sh file.pdf | jq '.ratings'

# View raw text
_scripts/test/show-extraction.sh file.pdf | jq -r '.rawText' | less
```

---

### 3. `show-all-extractions.sh` - All PDFs Detailed View

Shows detailed extraction output for all PDFs, one after another.

**Usage:**
```bash
# View in terminal (long output)
_scripts/test/show-all-extractions.sh

# Save all to JSON files
_scripts/test/show-all-extractions.sh --save
```

**Output Format:**

For each PDF, shows:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 _ptsd-denial.pdf
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 METADATA:
{
  "method": "docling",
  "confidence": 0.9,
  "pageCount": 13,
  "processingTimeMs": 21173
}

👤 VETERAN INFO:
{
  "firstName": "REDACTED",
  "lastName": "REDACTED",
  "ssn": "REDACTED"
}

⚖️  RATINGS (1 found):
[
  {
    "condition": "PTSD with mild alcohol use disorder...",
    "decision": "denied",
    "ratingPercentage": 0
  }
]

❌ DENIAL REASONS (1 found):
[...]

📝 RAW TEXT (first 500 chars):
October 28, 2020 JAMES FREDERICK LIVINGSTON...
```

**With `--save` flag:**

Saves JSON files to `_test-data/extraction-outputs/`:
- `_ptsd-denial.json`
- `_sleep-apnea-hypertension-approval.json`
- etc.

**Best for:**
- Comprehensive review of all extractions
- Creating test data archives
- Comparing extractions over time

---

## Workflow Examples

### Inspect a New PDF

```bash
# 1. Quick check if extraction works
_scripts/test/compare-extractions.sh

# 2. View full extraction
_scripts/test/show-extraction.sh _test-data/decisions/new-file.pdf

# 3. Check specific fields
_scripts/test/show-extraction.sh _test-data/decisions/new-file.pdf | jq '.ratings'
```

### Debug Extraction Issues

```bash
# See what raw text was extracted
_scripts/test/show-extraction.sh problematic.pdf | jq -r '.rawText' | less

# Check metadata
_scripts/test/show-extraction.sh problematic.pdf | jq '.extractionMetadata'

# Compare with working PDFs
_scripts/test/compare-extractions.sh
```

### Create Test Data Archive

```bash
# Save all current extractions
_scripts/test/show-all-extractions.sh --save

# Files saved to _test-data/extraction-outputs/
ls -lh _test-data/extraction-outputs/

# View saved extraction
jq '.' _test-data/extraction-outputs/_ptsd-denial.json | less
```

---

## Understanding Output Fields

### Metadata

```json
{
  "method": "docling",        // "docling" = real, "stub" = fake data
  "confidence": 0.9,          // Extraction confidence (0-1)
  "pageCount": 13,            // Number of pages processed
  "processingTimeMs": 21173   // Time taken (milliseconds)
}
```

### Ratings

```json
{
  "condition": "PTSD with mild alcohol use disorder",
  "decision": "denied",       // "granted" or "denied"
  "ratingPercentage": 0       // 0-100 (0 = denied or not yet parsed)
}
```

### Denial Reasons

```json
{
  "condition": "PTSD...",
  "reason": "this condition neither occurred in nor was caused by service",
  "category": "no_service_connection"  // Categorized denial reason
}
```

**Categories:**
- `no_service_connection` - Not connected to military service
- `insufficient_evidence` - Not enough documentation
- `does_not_meet_criteria` - Doesn't meet diagnostic criteria
- `medical_opinion_against` - Medical examiner opinion against claim
- `other` - Uncategorized or complex reason

---

## Troubleshooting

### "Python service not running"

Start the Python extraction service:
```bash
cd refinery-python
uvicorn main:app --reload --port 8000
```

### "Method: stub" instead of "docling"

The script is using relative paths instead of absolute paths. This is expected behavior when testing with `file://` URLs - the Python service will detect non-existent files and return stub data.

**Solution:** The scripts handle this automatically now. If you see "stub", the file may not exist or there's a path issue.

### Extraction is slow

Docling processes PDFs at ~1 page per second. A 20-page document takes ~20 seconds. This is normal.

To speed up testing:
- Use `compare-extractions.sh` (shows results from previous extractions)
- Test one PDF at a time with `show-extraction.sh`

### Ratings showing 0%

Currently, rating percentages are not being extracted from the "REASONS FOR DECISION" section. This is a known limitation and will be improved in Phase 1.

### Denial reasons showing "not specified"

Regex patterns for extracting denial reasons need refinement. The reasons ARE in the PDF, but the current patterns don't match the exact format. Will be improved in Phase 1.

---

## Related Scripts

- `test-all-decisions.sh` - Run full extraction pipeline with BullMQ (slower, more complete)
- `inspect-pdf-extraction.sh` - Similar to `show-extraction.sh` but with terminal formatting
- `isolated/test-python-extraction.sh` - Test Python service in isolation

---

## Output Format Reference

### Full JSON Structure

```json
{
  "documentId": "test-ptsd-denial-1760977426",
  "extractedAt": "2025-10-20T16:30:46.123456Z",
  "veteranInfo": {
    "firstName": "REDACTED",
    "lastName": "REDACTED",
    "ssn": "REDACTED"
  },
  "ratings": [
    {
      "condition": "PTSD with mild alcohol use disorder and unspecified anxiety disorder",
      "decision": "denied",
      "ratingPercentage": 0
    }
  ],
  "denialReasons": [
    {
      "condition": "PTSD with mild alcohol use disorder and unspecified anxiety disorder",
      "reason": "Reason not specified in decision letter",
      "category": "other"
    }
  ],
  "rawText": "October 28, 2020 JAMES FREDERICK LIVINGSTON...",
  "piiRedacted": true,
  "extractionMetadata": {
    "method": "docling",
    "confidence": 0.9,
    "pageCount": 13,
    "processingTimeMs": 21173
  }
}
```

---

## Next Steps

After viewing extractions:

1. **Improve regex patterns** - Update `extract_ratings_table()` and `extract_denial_reasons()` in `refinery-python/main.py`

2. **Add rating percentage extraction** - Parse the "REASONS FOR DECISION" section for percentages

3. **Test with more PDFs** - Add more test PDFs to `_test-data/decisions/`

4. **Compare before/after** - Use `--save` to archive current extractions before making changes
