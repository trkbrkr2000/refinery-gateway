# Refinery E2E Tests

End-to-end regression testing suite for the Refinery platform using Playwright.

## Overview

This repository contains comprehensive E2E tests for:
- **refinery-api** - REST API endpoints and document extraction
- **refinery-gateway** - Authentication, rate limiting, and API gateway
- **refinery-formready** - UI testing for form management
- **refinery-chrome-extension** - Extension functionality
- **Cross-service workflows** - Complete user journeys

## Project Structure

```
refinery-e2e-tests/
├── tests/
│   ├── api/              # API endpoint tests
│   ├── gateway/          # Gateway integration tests
│   ├── chrome-extension/ # Extension E2E flows
│   ├── formready/        # FormReady UI tests
│   └── workflows/        # Cross-service user journeys
├── fixtures/             # Test data (PDFs, forms, etc.)
├── utils/                # Shared test helpers
│   ├── auth.ts          # Authentication utilities
│   └── api-helpers.ts   # API request helpers
├── config/
│   └── environments/    # Environment configs (local, staging, prod)
└── .github/workflows/   # CI/CD pipelines
```

## Setup

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Local Development

```bash
# Run all tests against local environment
npm test

# Run specific project tests
npx playwright test --project=api-tests
npx playwright test --project=gateway-tests
npx playwright test --project=formready-ui
npx playwright test --project=workflows

# Run with UI mode for debugging
npx playwright test --ui

# Run specific test file
npx playwright test tests/api/health.spec.ts
```

### Against Different Environments

```bash
# Staging
TEST_ENV=staging npx playwright test

# Production (use with caution!)
TEST_ENV=production npx playwright test --grep @smoke
```

### Debugging

```bash
# Debug mode with browser visible
npx playwright test --debug

# Show test report
npx playwright show-report
```

## Environment Configuration

Tests use environment-specific configurations in `config/environments/`:

### Local (`local.ts`)
- API: `http://localhost:3001`
- Gateway: `http://localhost:3000`
- FormReady: `http://localhost:5173`
- Auth disabled by default

### Staging (`staging.ts`)
Configure via environment variables:
```bash
export STAGING_API_URL="https://api-staging.example.com"
export STAGING_GATEWAY_URL="https://gateway-staging.example.com"
export STAGING_FORMREADY_URL="https://staging-formready.example.com"
```

### Production (`production.ts`)
Configure via environment variables (same pattern as staging with `PROD_` prefix).

## Authentication

Test users are configured via environment variables:

```bash
export TEST_ADMIN_EMAIL="admin@test.com"
export TEST_ADMIN_PASSWORD="secure-password"
export TEST_USER_EMAIL="user@test.com"
export TEST_USER_PASSWORD="secure-password"
```

For local development, these default to test credentials in `utils/auth.ts`.

## Test Fixtures

Add test files to the `fixtures/` directory:
- PDF documents for extraction tests
- Sample forms
- Test images
- Invalid files for error testing

Example:
```
fixtures/
├── sample-va-form.pdf
├── invalid.txt
└── test-documents/
    └── multi-page.pdf
```

## CI/CD

### GitHub Actions Workflows

#### 1. **Full Test Suite** (`.github/workflows/test.yml`)
- Runs on push to main/develop
- Runs nightly at 2 AM UTC
- Can be triggered manually with environment selection
- Tests all projects in parallel

#### 2. **Smoke Tests** (`.github/workflows/smoke-tests.yml`)
- Runs post-deployment
- Quick validation of critical paths
- Triggered via webhook or manually
- Creates GitHub issue on failure

### Manual Triggers

```bash
# Trigger via GitHub CLI
gh workflow run test.yml -f environment=staging

# Trigger smoke tests after deployment
gh workflow run smoke-tests.yml -f environment=production
```

### Repository Dispatch (from deployment pipeline)

```bash
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/YOUR_ORG/refinery-e2e-tests/dispatches \
  -d '{"event_type":"deployment-complete","client_payload":{"environment":"staging"}}'
```

## Writing Tests

### API Tests Example

```typescript
import { test, expect } from '@playwright/test';
import { authenticateUser, TEST_USERS } from '../../utils/auth';
import { apiRequest } from '../../utils/api-helpers';

test('create document', async ({ request }) => {
  const tokens = await authenticateUser(request, TEST_USERS.regular);

  const response = await apiRequest(request, 'POST', '/documents', {
    tokens,
    data: { title: 'Test Document' }
  });

  expect(response.ok()).toBeTruthy();
});
```

### UI Tests Example

```typescript
import { test, expect } from '@playwright/test';
import { config } from '../../config/environments';

test('navigate to profile page', async ({ page }) => {
  await page.goto(`${config.formreadyUrl}/profile`);
  await expect(page.locator('h1')).toContainText('Profile');
});
```

## Best Practices

1. **Use Page Objects** for complex UI interactions
2. **Tag tests** with `@smoke`, `@regression`, `@slow` for selective runs
3. **Parallel execution** is enabled by default
4. **Retries** are automatic in CI (2 retries)
5. **Screenshots/videos** captured on failure
6. **Keep fixtures small** - use representative samples

## Tagging Tests

```typescript
test('critical user flow @smoke', async ({ page }) => {
  // Test code
});

test('comprehensive validation @regression @slow', async ({ page }) => {
  // Test code
});
```

Run tagged tests:
```bash
npx playwright test --grep @smoke
npx playwright test --grep @regression
```

## Troubleshooting

### Tests failing locally but passing in CI
- Check environment variables
- Verify services are running (`docker-compose up` or `npm run dev`)
- Clear Playwright cache: `npx playwright install --force`

### Authentication errors
- Verify test user credentials in environment variables
- Check if auth is disabled in local config
- Validate token expiration times

### Flaky tests
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Use `expect.poll()` for async assertions
- Increase timeout for slow operations

## Contributing

1. Write tests for new features before deployment
2. Update environment configs if new services are added
3. Keep test fixtures minimal and representative
4. Document complex test scenarios
5. Run tests locally before pushing

## License

Private - Refinery Platform