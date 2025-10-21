# VA Decision Letter Extraction - Testing Guide

## Overview

The VA Decision Letter extraction endpoint analyzes VA rating decision PDFs and extracts:
- ✅ Veteran personal information (name, SSN last 4)
- ✅ Combined disability ratings (current and historical)
- ✅ Monthly payment amounts (current and historical)
- ✅ Service-connected conditions with ratings
- ✅ Decision and effective dates

---

## Quick Start

### 1. Make sure API is running

```bash
cd refinery-api
npm run start
```

You should see: `🚀 Refinery API is running on: http://localhost:3001`

### 2. Test with a decision letter PDF

**Using the test script:**
```bash
./test-decision-extraction.sh ~/path/to/your-decision-letter.pdf
```

**Using curl directly:**
```bash
curl -X POST http://localhost:3001/api/v1/va-knowledge/extract-decision-info \
  -F "file=@/path/to/your-decision-letter.pdf" | jq '.'
```

---

## What Gets Extracted

### Example Response:

```json
{
  "success": true,
  "extracted_data": {
    "veteran_name": "James Livingston",
    "ssn_last_4": "1234",
    "decision_date": "May 12, 2025",
    "effective_date": "May 12, 2025",
    "combined_rating": 90,
    "is_at_100_percent": false,

    "conditions": [
      {
        "name": "Post Traumatic Stress Disorder",
        "status": "granted",
        "rating": 70,
        "source": "narrative"
      },
      {
        "name": "Left hand strain",
        "status": "increased",
        "rating": 10,
        "source": "narrative"
      },
      {
        "name": "Migraines",
        "status": "granted",
        "rating": 30,
        "source": "narrative"
      }
    ],

    "total_conditions": 3,
    "approved_conditions": 3,
    "denied_conditions": 0,
    "deferred_conditions": 0,

    "rating_history": [
      {
        "rating": 90,
        "effective_date": "May 12, 2025"
      },
      {
        "rating": 90,
        "effective_date": "May 8, 2025"
      },
      {
        "rating": 70,
        "effective_date": "Sep 9, 2019"
      }
    ],

    "current_monthly_payment": 3057.13,
    "monthly_payment_history": [
      {
        "amount": 3057.13,
        "effective_date": "May 12, 2025"
      },
      {
        "amount": 2458.91,
        "effective_date": "Aug 14, 2024"
      },
      {
        "amount": 1823.42,
        "effective_date": "Sep 9, 2019"
      }
    ]
  },

  "metadata": {
    "filename": "decision-letter.pdf",
    "pdf_pages": 4,
    "text_length": 15234
  }
}
```

---

## Supported Document Formats

The parser handles multiple VA letter formats:

### 1. **Rating Tables**
```
DISABILITIES                              RATING          STATUS
Post Traumatic Stress Disorder            70%             Service Connected
Tinnitus bilateral                        10%             Service Connected
```

### 2. **Combined Rating History Table**
```
Combined Rating Evaluation    Effective Date
70%                           Sep 9, 2019
90%                           Aug 14, 2024
```

### 3. **Monthly Payment Table**
```
Monthly Entitlement          Effective Date
$1,823.42                    Sep 9, 2019
$3,057.13                    May 12, 2025
```

### 4. **Narrative Descriptions**
```
Service connection for post-traumatic stress disorder is granted
with an evaluation of 70 percent effective September 9, 2019.

The evaluation for left hand strain is increased from 0 percent
to 10 percent effective May 12, 2025.
```

---

## Testing Tips

### Test with Sample Data

If you don't have a real decision letter, you can test with the health enrollment form:

```bash
cd refinery-api
./test-decision-extraction.sh current-test.pdf
```

(Note: This will extract data but it's not a rating decision letter, so results will be limited)

### Check Server Logs

Watch the server output for extraction details:

```bash
# In your server terminal, you'll see:
[extract-conditions] Found potential rating table
[extract-conditions] Extracted 3 conditions from table
[extract-rating-history] Found Combined Rating table
[extract-rating-history] Extracted 5 rating history entries
[extract-monthly-payment] Found Monthly Payment table
[extract-monthly-payment] Extracted 3 payment entries
```

### Verify Extraction Quality

Good signs:
- ✅ `total_conditions` > 0
- ✅ `combined_rating` is between 0-100
- ✅ `rating_history` has multiple entries
- ✅ `current_monthly_payment` is a reasonable dollar amount

Bad signs:
- ❌ `total_conditions` = 0 (parser didn't find any conditions)
- ❌ Very high condition count (>20) with weird names (over-matching)
- ❌ `combined_rating` = null (couldn't find rating)

---

## API Endpoint Details

**URL:** `POST /api/v1/va-knowledge/extract-decision-info`

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (PDF file upload)

**Response:**
- Content-Type: `application/json`
- Status: 200 OK on success

**Error Handling:**
```json
{
  "success": false,
  "error": "Failed to extract information from PDF",
  "details": "pdfParse is not a function"
}
```

---

## Utility Modules (For Developers)

The parsing logic is organized into modular utilities:

1. **[extract-veteran-info.ts](refinery-api/src/parsingUtilities/extract-veteran-info.ts)** - Name and SSN extraction
2. **[extract-dates.ts](refinery-api/src/parsingUtilities/extract-dates.ts)** - Decision and effective dates
3. **[extract-combined-rating.ts](refinery-api/src/parsingUtilities/extract-combined-rating.ts)** - Current combined rating
4. **[extract-rating-history.ts](refinery-api/src/parsingUtilities/extract-rating-history.ts)** - Rating history table
5. **[extract-monthly-payment.ts](refinery-api/src/parsingUtilities/extract-monthly-payment.ts)** - Payment history
6. **[extract-conditions.ts](refinery-api/src/parsingUtilities/extract-conditions.ts)** - Service-connected conditions

Each utility can be tested independently and improved without affecting others.

---

## Next Steps

### Improve Extraction Accuracy

1. **Add more test PDFs** - Collect various VA letter formats
2. **Tune regex patterns** - Adjust patterns in utilities to match edge cases
3. **Add validation** - Check extracted data makes sense (e.g., ratings add up correctly)

### Add Features

1. **Condition grouping** - Group by body system (musculoskeletal, mental health, etc.)
2. **Diagnostic codes** - Extract VA diagnostic codes (e.g., 9411 for PTSD)
3. **Dependency detection** - Identify spouse/dependent payments

### Deploy

Once testing is complete, the endpoint is ready for production use.

---

## Troubleshooting

### "Connection refused"
Make sure the API is running on port 3001:
```bash
cd refinery-api && npm run start
```

### "No PDF file provided"
Check your file path and make sure the file exists:
```bash
ls -lh /path/to/your-file.pdf
```

### "Failed to extract information"
Check server logs for detailed error messages. The PDF may be:
- Encrypted or password-protected
- Scanned image without OCR
- Corrupted or invalid PDF format

### Over-matching conditions
If you see 100+ conditions extracted, the patterns are too greedy. This happens with:
- Health enrollment forms (10-10EZ)
- Other non-rating decision letters

The parser is optimized for **VA disability rating decision letters**.

---

## Contact

For questions or issues, check:
- Server logs at `refinery-api` console
- API documentation at http://localhost:3001/api/docs
