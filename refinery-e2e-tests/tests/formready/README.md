# FormReady E2E Tests

This directory contains end-to-end tests for the ClaimReady FormReady application.

## Test Suites

### Anonymous Document Upload (`anonymous-upload.spec.ts`)

Comprehensive test suite validating the anonymous document upload flow with error handling improvements from Issue #5.

#### Test Coverage

**Upload Flow Tests:**
- ✅ Successful PDF upload and analysis (smoke test)
- ✅ File validation errors for invalid file types
- ✅ Three-stage progress indicator display
- ✅ Step completion visual feedback (checkmarks)

**Error Handling Tests:**
- ✅ Network error graceful handling
- ✅ Retry mechanism after errors
- ✅ Timeout handling (90-second limit)

**UI/UX Tests:**
- ✅ Success toast notification before redirect
- ✅ File type validation (pre-upload)
- ✅ Valid PDF file acceptance

**API Integration Tests:**
- ✅ Correct API call sequencing (presigned URL → analyze)
- ✅ Timeout graceful handling

#### Test Scenarios (11 total)

1. **Successful upload and analysis** `@smoke @critical`
   - Tests complete flow from file selection to results page
   - Validates 3-stage progress: Upload → Extract → Analyze
   - Checks automatic redirect to `/results/:sessionId`

2. **File validation - invalid type**
   - Uploads non-PDF file (`.txt`)
   - Expects error toast: "Invalid File Type"
   - Validates analyze button remains disabled

3. **Progress steps in correct order**
   - Verifies all 3 steps display correctly
   - Checks timing message: "This usually takes 30-60 seconds"

4. **Step completion with checkmarks**
   - Validates green checkmark icons appear for completed steps
   - Tests visual state transitions (gray → blue pulsing → green)

5. **Network error handling**
   - Simulates network failure
   - Validates error toast appears
   - Checks retry button availability

6. **Retry after error**
   - Tests retry button functionality
   - Validates second attempt succeeds after first fails

7. **Success toast before redirect**
   - Tests "Analysis Complete!" notification
   - Validates green border color
   - Checks message: "Redirecting to your results..."

8. **File type validation**
   - Tests pre-upload validation
   - Ensures immediate error feedback

9. **Valid PDF acceptance**
   - Tests analyze button enables for valid files
   - No error toasts should appear

10. **API call sequencing**
    - Tracks network requests
    - Validates: presigned URL request → S3 upload → analyze request
    - Ensures correct order

11. **Timeout handling**
    - Simulates 91-second delay (exceeds 90s timeout)
    - Validates timeout error message
    - Tests AbortController functionality

## Running Tests

### All FormReady Tests
```bash
npx playwright test tests/formready --project=formready-ui
```

### Anonymous Upload Tests Only
```bash
npx playwright test tests/formready/anonymous-upload.spec.ts --project=formready-ui
```

### Smoke Tests Only
```bash
npx playwright test tests/formready --project=formready-ui --grep="@smoke"
```

### Critical Tests Only
```bash
npx playwright test tests/formready --project=formready-ui --grep="@critical"
```

### With UI (Headed Mode)
```bash
npx playwright test tests/formready/anonymous-upload.spec.ts --project=formready-ui --headed
```

### Debug Mode
```bash
npx playwright test tests/formready/anonymous-upload.spec.ts --project=formready-ui --debug
```

## Test Configuration

Tests use environment-specific configuration from `config/environments/`:

**Local Environment:**
- FormReady URL: `http://localhost:3000`
- API URL: `http://localhost:3001`
- Auth: Disabled

**Required Services:**
- FormReady (Nuxt): Port 3000
- API (NestJS): Port 3001
- Python Service: Port 8000

## Test Fixtures

Located in `fixtures/`:
- `sample-va-form.pdf` - Valid test PDF document
- `invalid.txt` - Invalid file type for negative testing

## Known Issues & Limitations

1. **Button Text**: Tests use "Analyze Decision Letter" (actual UI text), not "Analyze Document"
2. **Timeouts**: Some tests may need longer timeouts for analysis operations (30-60 seconds)
3. **File Size**: Large file upload tests (>10MB) not yet implemented
4. **Authentication**: Tests run in anonymous mode; authenticated flow tests pending

## Test Maintenance

### Adding New Tests

1. Create test in `tests/formready/`
2. Use existing patterns from `anonymous-upload.spec.ts`
3. Tag appropriately: `@smoke`, `@critical`, `@regression`
4. Update this README

### Updating Selectors

If UI changes, update selectors in tests:
- Button text: `page.locator('button:has-text("Analyze Decision Letter")')`
- Progress indicators: `page.locator('text=Uploading document')`
- Toast notifications: `page.locator('[class*="border-green"]')`

### Adding Fixtures

1. Add file to `fixtures/`
2. Reference in test: `path.join(__dirname, '../../fixtures/your-file.pdf')`
3. Update `.gitignore` if sensitive

## CI/CD Integration

Tests run automatically on:
- Pull requests to `main` and `develop`
- Pre-deployment to staging
- Post-deployment validation

See `.github/workflows/` for CI configuration.

## Troubleshooting

### Tests Fail with Connection Refused
- Ensure FormReady is running on port 3000
- Check `config/environments/local.ts` has correct URL
- Verify services are up: `curl http://localhost:3000/analyze`

### Tests Timeout
- Increase timeout in test: `{ timeout: 60000 }`
- Check backend services are responsive
- Review API logs for slow operations

### File Upload Fails
- Verify fixture file exists
- Check file permissions
- Ensure file is valid PDF

## Related Documentation

- [ClaimReady E2E Testing Guide](../../README.md)
- [Playwright Documentation](https://playwright.dev)
- [Issue #5 - Error Handling](https://github.com/monkeybarrels/refinery-docs/issues/5)
