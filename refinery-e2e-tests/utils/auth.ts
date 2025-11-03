import { APIRequestContext } from '@playwright/test';
import { config } from '../config/environments';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface TestUser {
  email: string;
  password: string;
}

/**
 * Authenticate against the Gateway API and return tokens
 */
export async function authenticateUser(
  request: APIRequestContext,
  user: TestUser
): Promise<AuthTokens> {
  if (config.authDisabled) {
    return { accessToken: 'mock-token-local-dev' };
  }

  const response = await request.post(`${config.gatewayUrl}/auth/login`, {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  if (!response.ok()) {
    throw new Error(`Authentication failed: ${response.status()} ${await response.text()}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token || data.accessToken,
    refreshToken: data.refresh_token || data.refreshToken,
  };
}

/**
 * Get authorization headers for authenticated requests
 */
export function getAuthHeaders(tokens: AuthTokens): Record<string, string> {
  if (config.authDisabled) {
    return {};
  }

  return {
    Authorization: `Bearer ${tokens.accessToken}`,
  };
}

/**
 * Common test users (configure via env vars in CI)
 */
export const TEST_USERS = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'testpass123',
  },
  regular: {
    email: process.env.TEST_USER_EMAIL || 'user@test.com',
    password: process.env.TEST_USER_PASSWORD || 'testpass123',
  },
};