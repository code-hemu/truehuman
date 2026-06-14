import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    projects: [
      "vitest.unit.config.ts",
      "vitest.browser.config.ts",
    ],
  },
})
