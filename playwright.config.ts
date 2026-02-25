import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",

  /* Настройки скриншотов */
  snapshotPathTemplate: "{testDir}/screenshots/{testFileDir}/{projectName}/{arg}{ext}",

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: "http://localhost:8080",
    /* Настройки для каждого теста */
    screenshot: "only-on-failure", // Делать скриншот только при падении
    trace: "on-first-retry",
  },

  testMatch: ["**/*.test.ts", "**/*.test.tsx"],

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        /* Можно переопределить настройки для конкретного браузера */
        screenshot: "on", // Для этого браузера делать скриншоты всегда
      },
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        /* Для мобильных можно делать скриншоты всегда */
        screenshot: "on",
      },
    },

    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 12"],
        screenshot: "on",
      },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
