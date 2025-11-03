import { test, expect } from '@playwright/test';
import { authenticateUser, TEST_USERS } from '../../utils/auth';
import { apiRequest, uploadFile, waitForJobCompletion } from '../../utils/api-helpers';
import path from 'path';

test.describe.skip('Document Extraction API', () => {
  test('extract data from PDF document', async ({ request }) => {
    // TODO: Implement /extract endpoint in refinery-api
    const tokens = await authenticateUser(request, TEST_USERS.regular);
    const testPdfPath = path.join(__dirname, '../../fixtures/sample-va-form.pdf');
    const uploadResponse = await uploadFile(request, '/extract', testPdfPath, tokens);
    expect(uploadResponse.ok()).toBeTruthy();
  });
});
