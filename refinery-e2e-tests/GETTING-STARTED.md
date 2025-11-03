# Getting Started with E2E Tests

## Quick Summary of Test Results

You just ran the E2E tests and saw failures. **This is expected!** The tests failed because:
- ❌ API server not running at `http://localhost:3001`
- ❌ FormReady UI not running at `http://localhost:5173`
- ❌ Services aren't started locally

## Running Tests Successfully

### Option 1: Test Against Running Local Services

1. **Start all services:**
   ```bash
   # From refinery-repos root
   cd refinery-api && npm run dev &
   cd ../refinery-gateway && npm run dev &
   cd ../refinery-formready && npm run dev &

   # Or use your dev-start.sh script
   ./dev-start.sh
   ```

2. **Run E2E tests:**
   ```bash
   cd refinery-e2e-tests
   npm test
   ```

### Option 2: Run Only Smoke Tests (Quick Health Checks)

When services are running, test just the basics:
```bash
npm run test:smoke
```

### Option 3: Test Specific Projects

```bash
# Just API tests
npm run test:api

# Just FormReady UI tests
npm run test:formready

# Just workflow tests
npm run test:workflows
```

### Option 4: Test Against Staging/Production

```bash
# Test staging environment
TEST_ENV=staging npm test

# Test production (smoke tests only!)
TEST_ENV=production npm run test:smoke
```

## Understanding the Test Failures

### 1. API Health Check Failures
```
Error: "Cannot GET /health"
Status: 404
```
**Why:** API server not running at `http://localhost:3001`

**Fix:** Start refinery-api
```bash
cd ../refinery-api
npm run dev
```

### 2. FormReady Connection Refused
```
Error: net::ERR_CONNECTION_REFUSED at http://localhost:5173
```
**Why:** FormReady UI not running at `http://localhost:5173`

**Fix:** Start refinery-formready
```bash
cd ../refinery-formready
npm run dev
```

### 3. Missing Test Fixtures
```
Error: ENOENT: no such file or directory 'fixtures/sample-va-form.pdf'
```
**Why:** Test fixtures not yet created

**Fix:** Add test files to `fixtures/` directory
```bash
cd refinery-e2e-tests/fixtures
# Add your test PDFs, forms, etc.
```

## Creating Test Fixtures

Add these files to `fixtures/`:

1. **sample-va-form.pdf** - A valid VA form PDF for extraction tests
2. **invalid.txt** - A text file to test invalid file type handling
3. **test-documents/** - Directory with additional test documents

Example:
```bash
cd fixtures
# Copy a sample VA form
cp ~/Downloads/sample-form.pdf sample-va-form.pdf

# Create invalid test file
echo "This is not a PDF" > invalid.txt
```

## Next Steps

### For Local Development:
1. ✅ Tests are installed and working
2. ⏭️ Start your local services
3. ⏭️ Add test fixtures to `fixtures/`
4. ⏭️ Run tests: `npm test`

### For CI/CD:
1. ⏭️ Configure GitHub secrets (see README.md)
2. ⏭️ Set up staging/production URLs
3. ⏭️ Tests will run automatically on push/deploy

## Useful Commands

```bash
# Interactive UI mode (great for debugging)
npm run test:ui

# Debug specific test
npx playwright test tests/api/health.spec.ts --debug

# View last test report
npm run report

# Run tests in headed mode (see browser)
npx playwright test --headed
```

## Common Issues

### Tests are too slow
```bash
# Run tests in parallel (default)
npm test

# Limit workers for debugging
npx playwright test --workers=1
```

### Need to update snapshots
```bash
npx playwright test --update-snapshots
```

### Browser won't close
```bash
# Kill all browsers
pkill -f chromium
```

## What's Next?

1. **Add Real Test Data** - Replace example tests with real scenarios
2. **Configure Environments** - Update `config/environments/*.ts` with actual URLs
3. **Write Custom Tests** - Add tests specific to your workflows
4. **Set Up CI** - Configure GitHub Actions secrets

See the main [README.md](./README.md) for complete documentation.
