import { test, expect } from '@playwright/test';
import { config } from '../../config/environments';

test.describe('FormReady Profile Page', () => {
  test('profile page loads and displays user information', async ({ page }) => {
    await page.goto(`${config.formreadyUrl}/profile`);

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Profile');

    // Check for profile form fields
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('user can update profile information', async ({ page }) => {
    await page.goto(`${config.formreadyUrl}/profile`);

    // Fill in new information
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Profile updated');
  });
});