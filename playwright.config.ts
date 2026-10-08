import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: {
    command: 'pnpm --filter @pfx/playground build && pnpm --filter @pfx/playground preview --host 127.0.0.1',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
