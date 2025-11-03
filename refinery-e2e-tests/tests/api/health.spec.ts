import { test, expect } from '@playwright/test';
import { config } from '../../config/environments';

test.describe('API Health Checks', () => {
  test('API health endpoint returns 200 @smoke', async ({ request }) => {
    const response = await request.get(`${config.apiUrl}/api/health`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('API returns service metadata @smoke', async ({ request }) => {
    const response = await request.get(`${config.apiUrl}/api/health`);
    const data = await response.json();

    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
  });
});