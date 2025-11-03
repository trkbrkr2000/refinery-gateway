import { test, expect } from '@playwright/test';
import { config } from '../../config/environments';
import path from 'path';

test.describe('Anonymous Document Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to analyze page
    await page.goto(`${config.formreadyUrl}/analyze`);
  });

  test('should successfully upload and analyze a valid PDF @smoke @critical', async ({ page }) => {
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Analyze Your VA Decision Letter');

    // Locate the file input
    const fileInput = page.locator('input[type="file"]');

    // Upload a valid PDF
    const filePath = path.join(__dirname, '../../fixtures/sample-va-form.pdf');
    await fileInput.setInputFiles(filePath);

    // Click analyze button
    await page.locator('button:has-text("Analyze Decision Letter")').click();

    // Wait for progress indicators to appear
    await expect(page.locator('text=Analyzing Your Decision Letter')).toBeVisible({ timeout: 5000 });

    // Verify Step 1: Uploading document
    await expect(page.locator('text=Uploading document')).toBeVisible();

    // Verify Step 2: Extracting text from PDF
    await expect(page.locator('text=Extracting text from PDF')).toBeVisible();

    // Verify Step 3: Analyzing decision details
    await expect(page.locator('text=Analyzing decision details')).toBeVisible();

    // Wait for redirect to results page (allow up to 90 seconds for analysis)
    await expect(page).toHaveURL(/\/results\/[a-f0-9-]+/, { timeout: 95000 });

    // Verify we're on results page with analysis data
    await expect(page.locator('text=Analysis Results', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('should show validation error for invalid file type', async ({ page }) => {
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Analyze Your VA Decision Letter');

    // Locate the file input
    const fileInput = page.locator('input[type="file"]');

    // Upload an invalid file (txt instead of PDF)
    const filePath = path.join(__dirname, '../../fixtures/invalid.txt');
    await fileInput.setInputFiles(filePath);

    // Should see error toast notification
    await expect(page.locator('[class*="border-red"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Invalid File Type', { exact: false })).toBeVisible();
    await expect(page.locator('text=PDF files only', { exact: false })).toBeVisible();

    // Analyze button should not trigger upload
    const analyzeButton = page.locator('button:has-text("Analyze Decision Letter")');
    await expect(analyzeButton).toBeDisabled();
  });

  test('should show all three progress steps in correct order', async ({ page }) => {
    // Upload a valid PDF
    const fileInput = page.locator('input[type="file"]');
    const filePath = path.join(__dirname, '../../fixtures/sample-va-form.pdf');
    await fileInput.setInputFiles(filePath);

    // Click analyze
    await page.locator('button:has-text("Analyze Decision Letter")').click();

    // Wait for progress UI
    await expect(page.locator('text=Analyzing Your Decision Letter')).toBeVisible({ timeout: 5000 });

    // Verify all three steps are present
    const steps = [
      'Uploading document',
      'Extracting text from PDF',
      'Analyzing decision details'
    ];

    for (const step of steps) {
      await expect(page.locator(`text=${step}`)).toBeVisible();
    }

    // Verify timing message
    await expect(page.locator('text=This usually takes 30-60 seconds')).toBeVisible();
  });

  test('should show step completion with checkmarks', async ({ page }) => {
    // Upload and start analysis
    const fileInput = page.locator('input[type="file"]');
    const filePath = path.join(__dirname, '../../fixtures/sample-va-form.pdf');
    await fileInput.setInputFiles(filePath);
    await page.locator('button:has-text("Analyze Decision Letter")').click();

    // Wait for progress UI
    await expect(page.locator('text=Analyzing Your Decision Letter')).toBeVisible({ timeout: 5000 });

    // Wait a moment for steps to progress
    await page.waitForTimeout(2000);

    // At least step 1 should have completed (green background with checkmark)
    const step1Container = page.locator('text=Uploading document').locator('..');
    const step1Icon = step1Container.locator('.bg-green-500, svg[class*="text-green"]').first();

    // Step 1 should eventually show as complete
    await expect(step1Icon).toBeVisible({ timeout: 10000 });
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Upload a valid file
    const fileInput = page.locator('input[type="file"]');
    const filePath = path.join(__dirname, '../../fixtures/sample-va-form.pdf');
    await fileInput.setInputFiles(filePath);

    // Intercept the analyze request and make it fail
    await page.route('**/api/analyze/anonymous', route => {
      route.abort('failed');
    });

    // Click analyze
    await page.locator('button:has-text("Analyze Decision Letter")').click();

    // Should see error toast
    await expect(page.locator('[class*="border-red"]')).toBeVisible({ timeout: 10000 });

    // Should see retry option
    await expect(page.locator('text=Try Again', { exact: false })).toBeVisible();
  });

  test('should allow retry after error', async ({ page }) => {
    // Upload a valid file
    const fileInput = page.locator('input[type="file"]');
    const filePath = path.join(__dirname, '../../fixtures/sample-va-form.pdf');
    await fileInput.setInputFiles(filePath);

    let requestCount = 0;

    // Make first request fail, second succeed
    await page.route('**/api/analyze/anonymous', route => {
      requestCount++;
      if (requestCount === 1) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    // Click analyze (first attempt - will fail)
    await page.locator('button:has-text("Analyze Decision Letter")').click();

    // Wait for error toast
    await expect(page.locator('[class*="border-red"]')).toBeVisible({ timeout: 10000 });

    // Click retry button
    await page.locator('button:has-text("Try Again")').click();

    // Second attempt should succeed
    await expect(page).toHaveURL(/\/results\/[a-f0-9-]+/, { timeout: 95000 });
  });

  test('should display success toast before redirect', async ({ page }) => {
    // Upload and analyze
    const fileInput = page.locator('input[type="file"]');
    const filePath = path.join(__dirname, '../../fixtures/sample-va-form.pdf');
    await fileInput.setInputFiles(filePath);
    await page.locator('button:has-text("Analyze Decision Letter")').click();

    // Wait for success toast (appears before redirect)
    await expect(page.locator('text=Analysis Complete!', { exact: false })).toBeVisible({ timeout: 95000 });
    await expect(page.locator('text=Redirecting to your results', { exact: false })).toBeVisible();

    // Should have green border (success toast)
    await expect(page.locator('[class*="border-green"]')).toBeVisible();
  });
});

test.describe('Anonymous Upload - File Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${config.formreadyUrl}/analyze`);
  });

  test('should validate file type before upload', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Try uploading a non-PDF file
    const filePath = path.join(__dirname, '../../fixtures/invalid.txt');
    await fileInput.setInputFiles(filePath);

    // Should see error toast immediately
    await expect(page.locator('text=Invalid File Type', { exact: false })).toBeVisible({ timeout: 3000 });
  });

  test('should accept valid PDF files', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Upload valid PDF
    const filePath = path.join(__dirname, '../../fixtures/sample-va-form.pdf');
    await fileInput.setInputFiles(filePath);

    // Analyze button should become enabled
    await expect(page.locator('button:has-text("Analyze Decision Letter")')).toBeEnabled({ timeout: 3000 });

    // Should not show any error toasts
    await expect(page.locator('[class*="border-red"]')).not.toBeVisible();
  });
});

test.describe('Anonymous Upload - API Integration', () => {
  test('should make correct API calls in sequence', async ({ page }) => {
    // Track API calls
    const apiCalls: string[] = [];

    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/storage/upload/presigned')) {
        apiCalls.push('presigned');
      } else if (url.includes('/api/analyze/anonymous')) {
        apiCalls.push('analyze');
      }
    });

    // Upload and analyze
    const fileInput = page.locator('input[type="file"]');
    const filePath = path.join(__dirname, '../../fixtures/sample-va-form.pdf');
    await fileInput.setInputFiles(filePath);
    await page.locator('button:has-text("Analyze Decision Letter")').click();

    // Wait for redirect
    await expect(page).toHaveURL(/\/results\/[a-f0-9-]+/, { timeout: 95000 });

    // Verify API call sequence
    expect(apiCalls).toContain('presigned');
    expect(apiCalls).toContain('analyze');
    expect(apiCalls.indexOf('presigned')).toBeLessThan(apiCalls.indexOf('analyze'));
  });

  test('should handle timeout gracefully', async ({ page }) => {
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    const filePath = path.join(__dirname, '../../fixtures/sample-va-form.pdf');
    await fileInput.setInputFiles(filePath);

    // Intercept and delay the analyze request beyond timeout (90 seconds)
    await page.route('**/api/analyze/anonymous', async route => {
      await page.waitForTimeout(91000); // Exceed 90s timeout
      route.continue();
    });

    // Click analyze
    await page.locator('button:has-text("Analyze Decision Letter")').click();

    // Should see timeout error
    await expect(page.locator('text=taking longer than expected', { exact: false })).toBeVisible({ timeout: 95000 });
  });
});
