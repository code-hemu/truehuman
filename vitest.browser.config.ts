import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    name: "browser",
    browser: {
      enabled: true,
      provider: "playwright",
      headless: true,
      instances: [{ browser: "chromium" }],
    },
    globals: true,
    include: ["tests/browser/**/*.test.ts"],
  },
})
