import { defineConfig, devices } from '@playwright/test'

/**
 * VENDE YA — Playwright configuration
 * =====================================================================
 * Professional E2E testing. We test against the local dev server
 * (port 3000) and also support running against preview URLs.
 *
 * Run:
 *   bunx playwright test          # headless
 *   bunx playwright test --headed # visible browser
 *   bunx playwright test --ui     # interactive UI mode
 *   bunx playwright test --project=mobile  # mobile only
 *   bunx playwright test --project=desktop # desktop only
 * =====================================================================
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'tests/playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'es-PE',
    timezoneId: 'America/Lima',
  },
  projects: [
    // Mobile — emulated iPhone 14 viewport using Chromium
    // (we'd prefer webkit for true iOS fidelity, but system deps
    //  for webkit aren't installable in this sandbox; Chromium
    //  + device emulation gives 95% of the signal for free).
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 14'],
        browserName: 'chromium',
      },
    },
    // Desktop — Chrome
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Auto-start dev server if not running
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'bun run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
})
