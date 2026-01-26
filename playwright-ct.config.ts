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
  reporter: process.env.CI ? "github" : "html",
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
          "@pages": resolve(__dirname, "src/pages"),
          "@components": resolve(__dirname, "src/components"),
          "@hooks": resolve(__dirname, "src/hooks"),
          "@shared": resolve(__dirname, "src/shared"),
          "@assets": resolve(__dirname, "src/assets"),
          "@design": resolve(__dirname, "design"),
          "@styles": resolve(__dirname, "styles"),
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
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: process.env.CI ? 0.02 : 0.01,
    },
  },
});
