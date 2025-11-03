import { APIRequestContext, expect } from '@playwright/test';
import { getAuthHeaders, AuthTokens } from './auth';
import { config } from '../config/environments';

/**
 * Make an authenticated API request
 */
export async function apiRequest(
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  options: {
    data?: any;
    params?: Record<string, string>;
    tokens?: AuthTokens;
    baseUrl?: string;
  } = {}
) {
  const { data, params, tokens, baseUrl = config.apiUrl } = options;

  const headers = tokens ? getAuthHeaders(tokens) : {};
  const url = new URL(endpoint, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  return request.fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    data,
  });
}

/**
 * Upload a file to the API
 */
export async function uploadFile(
  request: APIRequestContext,
  endpoint: string,
  filePath: string,
  tokens?: AuthTokens,
  additionalFields?: Record<string, string>
) {
  const headers = tokens ? getAuthHeaders(tokens) : {};

  const formData = {
    file: filePath,
    ...additionalFields,
  };

  return request.post(`${config.apiUrl}${endpoint}`, {
    headers,
    multipart: formData,
  });
}

/**
 * Wait for a job to complete (polling)
 */
export async function waitForJobCompletion(
  request: APIRequestContext,
  jobId: string,
  tokens?: AuthTokens,
  options: {
    maxAttempts?: number;
    intervalMs?: number;
  } = {}
) {
  const { maxAttempts = 30, intervalMs = 1000 } = options;

  for (let i = 0; i < maxAttempts; i++) {
    const response = await apiRequest(request, 'GET', `/jobs/${jobId}`, { tokens });
    const job = await response.json();

    if (job.status === 'completed' || job.status === 'failed') {
      return job;
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Job ${jobId} did not complete within ${maxAttempts * intervalMs}ms`);
}

/**
 * Assert API response status and optionally validate response body
 */
export async function assertApiResponse(
  response: Response,
  expectedStatus: number,
  validator?: (data: any) => void
) {
  expect(response.status()).toBe(expectedStatus);

  if (validator && response.ok()) {
    const data = await response.json();
    validator(data);
  }
}