import { defineConfig, devices } from '@playwright/test';

const port = process.env.PORT ?? 8080;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: 'tests/ui',
  testMatch: '*.e2e-spec.ts',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: { baseURL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }],

  globalSetup: './tests/ui/setup',

  webServer: {
    url: baseURL + '/health',
    command: 'bun run start',
    reuseExistingServer: !process.env.CI,
  },
});
