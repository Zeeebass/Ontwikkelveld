import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: process.env.CI ? undefined : 1,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:5173/Ontwikkelveld/',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: process.platform === 'win32' ? 'msedge' : undefined } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium', channel: process.platform === 'win32' ? 'msedge' : undefined } },
  ],
  webServer: {
    command: 'node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173/Ontwikkelveld/',
    reuseExistingServer: !process.env.CI,
    env: { VITE_DEMO_MODE: 'true' },
  },
})
