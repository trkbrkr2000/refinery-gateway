# Test Fixtures

This directory contains test data used by the E2E tests.

## Required Fixtures

Add these files for tests to pass:

### 1. sample-va-form.pdf
A valid VA form PDF document for testing document extraction.

**Where to get it:**
- Download a sample VA form from va.gov
- Use a test form from your test data
- Create a simple PDF with form fields

**Used by:**
- `tests/api/extraction.spec.ts`
- `tests/workflows/end-to-end-extraction.spec.ts`

### 2. invalid.txt
A text file to test invalid file type handling.

**How to create:**
```bash
echo "This is not a PDF" > invalid.txt
```

**Used by:**
- `tests/api/extraction.spec.ts`
- `tests/workflows/end-to-end-extraction.spec.ts`

## Optional Fixtures

### test-documents/
Directory for additional test documents:
- Multi-page PDFs
- Different form types
- Edge cases (corrupted files, etc.)

### images/
Test images for image upload functionality:
- Sample JPEGs
- Sample PNGs
- Large images for size testing

## Adding Your Own Fixtures

1. Place files in this directory or subdirectories
2. Update tests to reference your fixtures:
   ```typescript
   const testFile = path.join(__dirname, '../../fixtures/my-test-file.pdf');
   ```

## Important Notes

- **Do NOT commit sensitive data** (real user information, credentials, etc.)
- Keep fixtures small (< 1MB each when possible)
- Use representative test data, not production data
- Add fixtures to `.gitignore` if they're too large

## Gitignore

Large or sensitive fixtures should be added to `.gitignore`:
```
fixtures/*.pdf
fixtures/large-files/
```

Then developers can add their own local test files.
