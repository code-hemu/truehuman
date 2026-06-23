import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  fullyParallel: true,
  webServer: {
    command: "node ./node_modules/serve/build/main.js . -p 4173",
    port: 4173,
    reuseExistingServer: false,
  },
  use: {
    baseURL: "http://localhost:4173",
  },
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
    // Requires Chrome installed locally — uncomment if available
    // {
    //   name: "chrome",
    //   use: { ...devices["Desktop Chrome"], channel: "chrome" },
    // },
    // Requires Edge installed locally — uncomment if available
    // {
    //   name: "msedge",
    //   use: { ...devices["Desktop Edge"], channel: "msedge" },
    // },
    {
      name: "Pixel 5",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Galaxy S9+",
      use: { ...devices["Galaxy S9+"] },
    },
    {
      name: "OnePlus 9",
      use: { ...devices["OnePlus 9"] },
    },
    {
      name: "Galaxy Tab S4",
      use: { ...devices["Galaxy Tab S4"] },
    },
    {
      name: "iPhone 13",
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "iPhone 14 Pro Max",
      use: { ...devices["iPhone 14 Pro Max"] },
    },
    {
      name: "iPhone 15 Pro Max",
      use: { ...devices["iPhone 15 Pro Max"] },
    },
    {
      name: "iPad Pro 11",
      use: { ...devices["iPad Pro 11"] },
    },
    {
      name: "iPad Mini",
      use: { ...devices["iPad Mini"] },
    },
    {
      name: "Galaxy Fold",
      use: { ...devices["Galaxy Fold"] },
    },
    {
      name: "Surface Duo",
      use: { ...devices["Surface Duo"] },
    },
  ],
})
