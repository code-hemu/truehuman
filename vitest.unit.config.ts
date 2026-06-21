import { defineConfig } from "vitest/config"

export default defineConfig({
  define: { __DEV__: true },
  test: {
    name: "unit",
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
})
