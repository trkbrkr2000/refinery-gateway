import { defineConfig, devices } from '@playwright/test';
import { config } from './config/environments';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],

  use: {
    baseURL: config.apiUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'api-tests',
      testDir: './tests/api',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'gateway-tests',
      testDir: './tests/gateway',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'formready-ui',
      testDir: './tests/formready',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: config.formreadyUrl,
      },
    },
    {
      name: 'chrome-extension',
      testDir: './tests/chrome-extension',
      use: {
        ...devices['Desktop Chrome'],
        // Extension tests will load the extension manually
      },
    },
    {
      name: 'workflows',
      testDir: './tests/workflows',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server if needed
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});