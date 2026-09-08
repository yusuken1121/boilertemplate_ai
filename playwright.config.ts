import { defineConfig, devices } from "@playwright/test"

const PORT = 3100
const baseURL = `http://127.0.0.1:${PORT}`

/**
 * Smoke tests only — enough to catch a broken route guard or a page that no
 * longer renders. They deliberately avoid anything needing a database or a
 * real API key, so `pnpm test:e2e` works on a fresh clone.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Auth.js refuses to verify a session without one. Test-only value.
      AUTH_SECRET: "e2e-secret-not-used-in-production",
    },
  },
})
