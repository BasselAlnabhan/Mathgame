// playwright.config.cjs
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/e2e', // Directory where E2E tests are located
    fullyParallel: true, // Run tests in parallel
    forbidOnly: !!process.env.CI, // Fail the build on CI if you accidentally left test.only in the source code
    retries: process.env.CI ? 2 : 0, // Retry on CI only
    workers: process.env.CI ? 1 : undefined, // Opt for fewer workers on CI if needed
    reporter: 'html', // Reporter to use. See https://playwright.dev/docs/test-reporters
    use: {
        baseURL: 'http://localhost:4173', // Base URL to use for actions like `await page.goto('/')` - Updated to match actual server port
        trace: 'on-first-retry', // Record trace only when retrying a test for debugging
        // headless: false, // Uncomment to run tests with a visible browser for debugging
        // launchOptions: {
        //   slowMo: 250, // Slows down Playwright operations by 250ms to observe tests
        // },
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // Uncomment to test on other browsers
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },
        // Test against mobile viewports.
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },
    ],
    outputDir: 'test-results/',

    webServer: {
        command: 'npm run dev', // Command to start your dev server
        url: 'http://localhost:4173', // URL to wait for before starting tests - Updated to match actual server port
        reuseExistingServer: !process.env.CI, // Reuse dev server when running locally
        timeout: 120 * 1000, // 2 minutes to start the server
    },
}); 