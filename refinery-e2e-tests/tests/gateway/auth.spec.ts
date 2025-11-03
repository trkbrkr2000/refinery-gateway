import { test, expect } from '@playwright/test';
import { config } from '../../config/environments';

test.describe('Gateway Authentication', () => {
  test.skip(config.authDisabled, 'Auth is disabled in this environment');

  test('login with valid credentials returns tokens @smoke', async ({ request }) => {
    const response = await request.post(`${config.gatewayUrl}/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'testpass123',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('access_token');
  });

  test('login with invalid credentials fails', async ({ request }) => {
    const response = await request.post(`${config.gatewayUrl}/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('protected endpoint rejects unauthenticated requests', async ({ request }) => {
    const response = await request.get(`${config.gatewayUrl}/api/protected`);
    expect(response.status()).toBe(401);
  });
});