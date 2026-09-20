import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:5174',
    browserName: 'chromium',
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: !process.env.CI,
  },
});
