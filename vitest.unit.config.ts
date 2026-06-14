import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    name: "unit",
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
})
