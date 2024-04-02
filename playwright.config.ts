import { defineConfig, devices } from '@playwright/test';

const env = process.env;
const PORT = process.env.PORT ?? '8081';
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'tests/ui',
  testMatch: '*.e2e-spec.ts',

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: { baseURL, trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],

  webServer: {
    url: baseURL + '/health',
    command: 'bun run tests/ui/setup.ts',
    reuseExistingServer: !process.env.CI,
    env: { ...env, PORT, NODE_ENV: 'test' },
  },
});
