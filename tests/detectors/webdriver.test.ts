import { vi, describe, it, expect } from "vitest"

vi.mock("../../src/utils/helpers.js", () => ({
  isPropertyNative: () => true,
}))

import { detectWebDriver } from "../../src/detectors/webdriver.js"

describe("detectWebDriver", () => {
  it("returns not detected in a clean environment", () => {
    const result = detectWebDriver()
    expect(result.name).toBe("webdriver")
    expect(result.detected).toBe(false)
    expect(result.suspicious).toBe(false)
    expect(result.weight).toBe(0)
    expect(result.riskDelta).toBe(0)
    expect(result.details).toBeUndefined()
  })

  it("detects when navigator.webdriver is set", () => {
    const orig = Object.getOwnPropertyDescriptor(navigator, "webdriver")
    Object.defineProperty(navigator, "webdriver", { value: true, configurable: true })
    try {
      const result = detectWebDriver()
      expect(result.detected).toBe(true)
      expect(result.suspicious).toBe(false)
      expect(result.weight).toBeGreaterThanOrEqual(25)
      expect(result.riskDelta).toBe(result.weight)
      expect(result.details?.webdriver).toBe(true)
    } finally {
      if (orig) {
        Object.defineProperty(navigator, "webdriver", orig)
      } else {
        Object.defineProperty(navigator, "webdriver", { value: false, configurable: true })
      }
    }
  })
})
