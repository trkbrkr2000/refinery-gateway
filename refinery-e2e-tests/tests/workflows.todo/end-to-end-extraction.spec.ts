import { test, expect } from '@playwright/test';
import { authenticateUser, TEST_USERS } from '../../utils/auth';
import { uploadFile, waitForJobCompletion } from '../../utils/api-helpers';
import { config } from '../../config/environments';
import path from 'path';

test.describe('End-to-End Document Extraction Workflow', () => {
  test('complete workflow: upload, extract, view results in UI', async ({ page, request }) => {
    // Step 1: Authenticate via API
    const tokens = await authenticateUser(request, TEST_USERS.regular);

    // Step 2: Upload document via API
    const testPdfPath = path.join(__dirname, '../../fixtures/sample-va-form.pdf');
    const uploadResponse = await uploadFile(
      request,
      '/extract',
      testPdfPath,
      tokens
    );

    expect(uploadResponse.ok()).toBeTruthy();
    const { jobId } = await uploadResponse.json();

    // Step 3: Wait for extraction to complete
    const job = await waitForJobCompletion(request, jobId, tokens);
    expect(job.status).toBe('completed');

    // Step 4: Navigate to FormReady and verify extracted data appears
    await page.goto(`${config.formreadyUrl}/documents/${job.documentId}`);

    // Verify document details are displayed
    await expect(page.locator('.document-title')).toBeVisible();
    await expect(page.locator('.extraction-status')).toContainText('Completed');

    // Verify extracted fields are populated
    const extractedFields = page.locator('.extracted-field');
    await expect(extractedFields).not.toHaveCount(0);
  });

  test('workflow handles extraction errors gracefully', async ({ page, request }) => {
    const tokens = await authenticateUser(request, TEST_USERS.regular);

    // Upload invalid document
    const invalidFilePath = path.join(__dirname, '../../fixtures/invalid.txt');
    const uploadResponse = await uploadFile(
      request,
      '/extract',
      invalidFilePath,
      tokens
    );

    expect(uploadResponse.status()).toBe(400);

    // Verify error is communicated clearly
    const error = await uploadResponse.json();
    expect(error.message).toBeTruthy();
  });
});