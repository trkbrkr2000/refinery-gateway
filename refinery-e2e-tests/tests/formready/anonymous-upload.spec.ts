import { test, expect } from '@playwright/test';
import { config } from '../../config/environments';
import path from 'path';

test.describe('Anonymous Document Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${config.formreadyUrl}/analyze`);
    await page.waitForLoadState('networkidle');
  });

  test('should load analyze page @smoke', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Analyze Your VA Decision Letter');
  });

  test('should show file upload zone', async ({ page }) => {
    // Check for file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('should enable button after valid PDF upload', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const filePath = path.join(__dirname, '../../fixtures/sample-va-form.pdf');

    await fileInput.setInputFiles(filePath);

    // Wait for button to appear
    await page.waitForSelector('button:has-text("Analyze Decision Letter")', { timeout: 5000 });

    const analyzeButton = page.locator('button:has-text("Analyze Decision Letter")');
    await expect(analyzeButton).toBeVisible();
  });
});

test.describe('File Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${config.formreadyUrl}/analyze`);
    await page.waitForLoadState('networkidle');
  });

  test('should show error for invalid file type', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const filePath = path.join(__dirname, '../../fixtures/invalid.txt');

    await fileInput.setInputFiles(filePath);

    // Wait a moment for validation
    await page.waitForTimeout(1000);

    // Check for error message (could be in toast or inline)
    const hasError = await page.locator('text=/invalid|error|pdf/i').count() > 0;
    expect(hasError).toBeTruthy();
  });
});
