import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig, devices } from "@playwright/experimental-ct-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  testDir: "./src",
  /* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toHaveScreenshot. */
  snapshotPathTemplate: "{testDir}/{testFileDir}/screens/{projectName}/{testName}{ext}",
  /* Maximum time one test can run for. */
  timeout: 10 * 1000,
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
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Port to use for Playwright component endpoint. */
    ctPort: 3100,
    ctViteConfig: {
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: {
          "@": resolve(__dirname, "src"),
          "@app": resolve(__dirname, "src/app"),
          "@assets": resolve(__dirname, "src/assets"),
          "@entities": resolve(__dirname, "src/entities"),
          "@features": resolve(__dirname, "src/features"),
          "@pages": resolve(__dirname, "src/pages"),
          "@shared": resolve(__dirname, "src/shared"),
          "@widgets": resolve(__dirname, "src/widgets"),
        },
      },
    },
  },
  testMatch: ["**/*.test.tsx", "**/*.test.ts"],

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: process.env.CI ? 0.02 : 0.01,
    },
  },
});
